import axios from "axios";

let testCases = [
    {
        "name": "❌ Syntax Error: Missing closing parenthesis",
        "code": "print('Hello'"
    },
    {
        "name": "❌ Syntax Error: Unexpected Indentation",
        "code": "  print('Hello')"
    },
    {
        "name": "❌ Syntax Error: Unterminated String",
        "code": "print('Hello"
    },
    {
        "name": "⚠️ Bad Practice: Using `eval()` function",
        "code": "eval('print(5+5)')"
    },
    {
        "name": "⚠️ Security Risk: Hardcoded Password",
        "code": "password = 'mypassword123'"
    },
    {
        "name": "⚠️ Security Risk: Executing Shell Commands with `os.system`",
        "code": "import os\nos.system('rm -rf /')"
    },
    {
        "name": "❌ Undefined Variable: Using an undeclared variable",
        "code": "print(undeclared_var)"
    },
    {
        "name": "⚠️ Potential Runtime Error: Division by Zero",
        "code": "x = 5 / 0"
    },
    {
        "name": "⚠️ Should recommend using `is` for None comparisons",
        "code": "if x == None: print('x is None')"
    },
    {
        "name": "⚠️ Using Mutable Default Arguments (Common Bug)",
        "code": "def func(lst=[]): lst.append(1); return lst"
    },
    {
        "name": "⚠️ Unused Import Detected",
        "code": "import numpy"
    },
    {
        "name": "❌ Infinite Loop: while True without break",
        "code": "while True:\n    print('Running...')"
    },
    {
        "name": "⚠️ Inefficient String Concatenation in Loop",
        "code": "result = ''\nfor i in range(1000):\n    result += str(i)"
    },
    {
        "name": "⚠️ Variable Shadowing Detected",
        "code": "def example():\n    list = [1, 2, 3]\n    return list"
    },
    {
        "name": "⚠️ Function Argument Type Mismatch",
        "code": "def add(a: int, b: int) -> int:\n    return a + b\n\nadd('1', 2)"
    },
    {
        "name": "⚠️ Deprecated Function Usage",
        "code": "import collections\nprint(collections.MutableMapping)"
    },
    {
        "name": "❌ Reassigning a Built-in Function",
        "code": "list = [1,2,3]"
    },
    {
        "name": "⚠️ Function Declared but Never Used",
        "code": "def unused_function():\n    return 42"
    },
    {
        "name": "❌ Attempting to Modify a Tuple",
        "code": "tup = (1,2,3)\ntup[0] = 5"
    },
    {
        "name": "⚠️ Missing `self` in Class Method",
        "code": "class Example:\n    def method():\n        return 'Hello'"
    },
    {
        "name": "⚠️ Using `except:` Without Specifying Exception Type",
        "code": "try:\n    x = 1 / 0\nexcept:\n    print('Error!')"
    },
    {
        "name": "⚠️ Loop Variable Not Used",
        "code": "for i in range(10):\n    print('Hello')"
    },
    {
        "name": "❌ Invalid Syntax: Mixing Tabs and Spaces",
        "code": "def func():\n\tprint('Hello')"
    }
]

  
testCases.forEach(({ name, code }) => {
  axios.post("http://localhost:3000/api/analyze", { code, language: "python" })
    .then(response => {
      console.log(`🔎 Running Test: ${name}`);
      console.log("✅ Server Response:", JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
      console.error(`❌ Test Failed: ${name}`);
      console.error(error.response?.data || error.message);
    });
});
