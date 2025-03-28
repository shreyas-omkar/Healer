import { spawn } from "child_process";

export const analyzePython = async (code) => {
    return new Promise((resolve, reject) => {
        const pythonScript = `
import ast, json, sys

def analyze_python_code(code):
    issues = []

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return [f"❌ Syntax Error: {str(e)}"]

    import_usage = set()
    defined_functions = set()
    variables = set()
    builtins = set(dir(__builtins__))  # Track shadowed built-ins

    for node in ast.walk(tree):
        try:
            # ❌ Dangerous Functions
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                if node.func.id in ['eval', 'exec']:
                    issues.append(f"❌ Security Risk: Avoid using '{node.func.id}()'.")

            # ⚠️ Hardcoded Passwords
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and "password" in target.id.lower():
                        issues.append("⚠️ Security Risk: Hardcoded password detected.")
                    variables.add(target.id)

            # ⚠️ OS Command Execution
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if isinstance(node.func.value, ast.Name) and node.func.value.id == 'os':
                    if node.func.attr in ['system', 'popen', 'remove', 'rmdir']:
                        issues.append(f"⚠️ Security Risk: Avoid using 'os.{node.func.attr}()'.")

            # ⚠️ Infinite Loops
            if isinstance(node, ast.While) and isinstance(node.test, ast.Constant) and node.test.value is True:
                if not any(isinstance(subnode, ast.Break) for subnode in ast.walk(node)):
                    issues.append("⚠️ Infinite Loop: 'while True' without a 'break'.")

            # ⚠️ Mutable Default Arguments
            if isinstance(node, ast.FunctionDef):
                for arg in node.args.defaults:
                    if isinstance(arg, (ast.List, ast.Dict, ast.Set)):
                        issues.append("⚠️ Bad Practice: Mutable default arguments detected.")
                defined_functions.add(node.name)

            # ⚠️ Bare 'except:' (Catches Everything)
            if isinstance(node, ast.ExceptHandler) and node.type is None:
                issues.append("⚠️ Bad Practice: Use 'except Exception as e:' instead of a bare 'except:'.")

            # ⚠️ Unused Variables
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
                variables.add(node.id)

            # ⚠️ Using 'print()' (Leftover Debugging)
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                if node.func.id == 'print':
                    issues.append("⚠️ Debugging Detected: Remove print() statements before production.")

            # ⚠️ Shadowing Built-in Names
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id in builtins:
                        issues.append(f"⚠️ Bad Practice: Avoid shadowing built-in function '{target.id}'.")

            # ⚠️ Detect Deeply Nested Loops (Performance Warning)
            loop_depth = 0
            parent = node
            while isinstance(parent, (ast.For, ast.While)):
                loop_depth += 1
                parent = getattr(parent, "parent", None)
            if loop_depth >= 3:
                issues.append("⚠️ Performance Warning: Deeply nested loops detected.")

            # Track import usage
            if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                for alias in node.names:
                    import_usage.add(alias.name)

        except AttributeError:
            pass  # Ignore errors from unexpected AST structures

    # Detect unused imports
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and node.id in import_usage:
            import_usage.remove(node.id)

    for unused in import_usage:
        issues.append(f"⚠️ Unused import detected: {unused}")

    return issues if issues else ["✅ Code looks clean!"]

if __name__ == "__main__":
    input_code = sys.stdin.read()
    print(json.dumps(analyze_python_code(input_code)))
`;

        const pythonProcess = spawn("python", ["-c", pythonScript]);

        let output = "";
        let errorOutput = "";

        pythonProcess.stdout.on("data", (data) => (output += data.toString()));
        pythonProcess.stderr.on("data", (data) => (errorOutput += data.toString()));

        pythonProcess.on("close", (code) => {
            if (code !== 0 || errorOutput) {
                reject({ error: `Python script error: ${errorOutput}` });
                return;
            }

            try {
                resolve({ language: "Python", suggestions: JSON.parse(output.trim()) });
            } catch (parseError) {
                reject({ error: `Failed to parse Python output: ${parseError.message}` });
            }
        });

        pythonProcess.stdin.write(code);
        pythonProcess.stdin.end();
    });
};