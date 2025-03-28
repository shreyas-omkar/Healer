import * as babelParser from "@babel/parser";
import traverse from "@babel/traverse";

export const analyzeJavaScript = (code) => {
    let issues = [];
    let declaredVariables = new Set();
    let globalModifications = new Set();

    // ✅ Step 1: Detect Syntax Errors
    try {
        babelParser.parse(code, { sourceType: "module", plugins: ["jsx"] });
    } catch (syntaxError) {
        return { 
            language: "JavaScript", 
            suggestions: [`❌ Syntax Error: ${syntaxError.message}`] 
        };
    }

    // ✅ Step 2: Traverse AST for Runtime Issues & Bad Practices
    try {
        const ast = babelParser.parse(code, { sourceType: "module", plugins: ["jsx"] });

        traverse.default(ast, {
            // ✅ Track all declared variables
            VariableDeclarator(path) {
                if (path.node.id.name) {
                    if (declaredVariables.has(path.node.id.name)) {
                        issues.push(`❌ Variable '${path.node.id.name}' is declared multiple times.`);
                    }
                    declaredVariables.add(path.node.id.name);
                }
            },
            FunctionDeclaration(path) {
                if (path.node.id && path.node.id.name) {
                    declaredVariables.add(path.node.id.name);
                }
                path.node.params.forEach(param => {
                    if (param.name) declaredVariables.add(param.name);
                });
            },
            ArrowFunctionExpression(path) {
                path.node.params.forEach(param => {
                    if (param.name) declaredVariables.add(param.name);
                });

                if (path.node.body.type === "BlockStatement" && path.node.body.body.length === 0) {
                    issues.push("⚠️ Arrow function should have an explicit return value.");
                }
            },
            ClassDeclaration(path) {
                if (path.node.id && path.node.id.name) {
                    declaredVariables.add(path.node.id.name);
                }
            },
            // ✅ Detect Undefined Variables (excluding declared ones)
            Identifier(path) {
                const parentType = path.parent.type;
                if (
                    !declaredVariables.has(path.node.name) && 
                    parentType !== "VariableDeclarator" &&
                    parentType !== "FunctionDeclaration" &&
                    parentType !== "FunctionExpression" &&
                    parentType !== "MemberExpression" &&
                    parentType !== "ObjectProperty"
                ) {
                    issues.push(`❌ Possible undefined variable: '${path.node.name}'`);
                }
            },
            // ✅ Detect Unreachable Code
            BlockStatement(path) {
                let foundReturn = false;
                path.node.body.forEach(statement => {
                    if (foundReturn) {
                        issues.push("⚠️ Unreachable code detected after a return statement.");
                    }
                    if (statement.type === "ReturnStatement") {
                        foundReturn = true;
                    }
                });
            },
            // ✅ Detect Infinite Loops
            WhileStatement(path) {
                if (path.node.test.type === "BooleanLiteral" && path.node.test.value === true) {
                    issues.push("⚠️ Possible infinite loop detected with `while(true) {}`.");
                }
            },
            // ✅ Detect Dangerous Global Modifications
            AssignmentExpression(path) {
                if (
                    path.node.left.type === "MemberExpression" &&
                    path.node.left.object.name === "window"
                ) {
                    globalModifications.add(path.node.left.property.name);
                }
            },
            // ✅ Detect Unsafe eval() Usage
            CallExpression(path) {
                if (path.node.callee.name === "eval") {
                    issues.push("❌ Avoid using 'eval()' due to security risks.");
                }
            },
            // ✅ Detect Bad Console Function Calls
            MemberExpression(path) {
                if (
                    path.node.object.name === "console" &&
                    !["log", "warn", "error", "info", "debug"].includes(path.node.property.name)
                ) {
                    issues.push(`❌ Unknown console function: console.${path.node.property.name}()`);
                }
            }
        });

        // 🚨 Check for Global Modifications
        if (globalModifications.size > 0) {
            issues.push(`❌ Avoid modifying global properties: ${[...globalModifications].join(", ")}`);
        }

    } catch (parsingError) {
        return { language: "JavaScript", suggestions: [`❌ Parsing Error: ${parsingError.message}`] };
    }

    return { language: "JavaScript", suggestions: issues.length ? issues : ["✅ Code looks clean!"] };
};
