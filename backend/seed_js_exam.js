const jsQuestions = [
  // --- Section A: Multiple Choice Questions (10 Questions × 1 Mark = 10 Marks) ---
  {
    order: 1,
    marks: 1.0,
    text: "Section A (Q1): Which keyword is used to declare a variable whose value can be reassigned?",
    explanation: "'let' allows reassignment of variables and is block-scoped.",
    options: [
      { text: "const", isCorrect: false },
      { text: "let", isCorrect: true },
      { text: "fixed", isCorrect: false },
      { text: "static", isCorrect: false }
    ]
  },
  {
    order: 2,
    marks: 1.0,
    text: "Section A (Q2): Which function displays output in the browser console?",
    explanation: "console.log() prints messages and objects to the browser debugging console.",
    options: [
      { text: "print()", isCorrect: false },
      { text: "display()", isCorrect: false },
      { text: "console.log()", isCorrect: true },
      { text: "document.writeConsole()", isCorrect: false }
    ]
  },
  {
    order: 3,
    marks: 1.0,
    text: "Section A (Q3): Which of the following is a valid JavaScript data type?",
    explanation: "Boolean (true/false) is a primitive JavaScript data type.",
    options: [
      { text: "Integer", isCorrect: false },
      { text: "Character", isCorrect: false },
      { text: "Boolean", isCorrect: true },
      { text: "Float", isCorrect: false }
    ]
  },
  {
    order: 4,
    marks: 1.0,
    text: "Section A (Q4): What is the output of console.log(typeof \"Hello\")?",
    explanation: "typeof string literals in JavaScript evaluates to lowercase 'string'.",
    options: [
      { text: "text", isCorrect: false },
      { text: "String", isCorrect: false },
      { text: "string", isCorrect: true },
      { text: "char", isCorrect: false }
    ]
  },
  {
    order: 5,
    marks: 1.0,
    text: "Section A (Q5): Which operator checks both value and data type equality?",
    explanation: "=== (strict equality) checks both value and data type without type coercion.",
    options: [
      { text: "=", isCorrect: false },
      { text: "==", isCorrect: false },
      { text: "===", isCorrect: true },
      { text: "!=", isCorrect: false }
    ]
  },
  {
    order: 6,
    marks: 1.0,
    text: "Section A (Q6): Which function accepts input from a user through a browser dialog box?",
    explanation: "prompt() displays a dialog box prompting the visitor for input.",
    options: [
      { text: "alert()", isCorrect: false },
      { text: "prompt()", isCorrect: true },
      { text: "console.log()", isCorrect: false },
      { text: "confirmText()", isCorrect: false }
    ]
  },
  {
    order: 7,
    marks: 1.0,
    text: "Section A (Q7): Which statement is used to execute code when a condition is false?",
    explanation: "The 'else' block executes when the preceding 'if' condition evaluates to false.",
    options: [
      { text: "if", isCorrect: false },
      { text: "else", isCorrect: true },
      { text: "switch", isCorrect: false },
      { text: "case", isCorrect: false }
    ]
  },
  {
    order: 8,
    marks: 1.0,
    text: "Section A (Q8): Which keyword is used to exit a switch case and prevent fall-through?",
    explanation: "The 'break' keyword terminates the current switch case statement execution.",
    options: [
      { text: "stop", isCorrect: false },
      { text: "exit", isCorrect: false },
      { text: "break", isCorrect: true },
      { text: "returncase", isCorrect: false }
    ]
  },
  {
    order: 9,
    marks: 1.0,
    text: "Section A (Q9): What is the output of console.log(10 % 3)?",
    explanation: "10 divided by 3 is 3 with remainder 1, so 10 % 3 yields 1.",
    options: [
      { text: "3", isCorrect: false },
      { text: "1", isCorrect: true },
      { text: "0", isCorrect: false },
      { text: "10", isCorrect: false }
    ]
  },
  {
    order: 10,
    marks: 1.0,
    text: "Section A (Q10): Which keyword specifies the default block in a switch statement?",
    explanation: "The 'default' keyword executes code if there is no case match in a switch statement.",
    options: [
      { text: "else", isCorrect: false },
      { text: "default", isCorrect: true },
      { text: "otherwise", isCorrect: false },
      { text: "finally", isCorrect: false }
    ]
  },

  // --- Section B: Short Answer Questions (5 Questions × 2 Marks = 10 Marks) ---
  {
    order: 11,
    marks: 2.0,
    text: "Section B (Q11): Define JavaScript and write any two uses of it.",
    explanation: "JavaScript is an interactive client and server-side scripting language used for interactive frontends and Node.js backend development.",
    options: [
      { text: "JavaScript is a lightweight, cross-platform scripting language used to create dynamic, interactive web pages and backend web applications.", isCorrect: true },
      { text: "JavaScript is a styling language used only to format HTML colors and margins.", isCorrect: false },
      { text: "JavaScript is a relational database management system like MySQL.", isCorrect: false },
      { text: "JavaScript is compiled directly to BIOS firmware.", isCorrect: false }
    ]
  },
  {
    order: 12,
    marks: 2.0,
    text: "Section B (Q12): Explain the difference between let, const, and var.",
    explanation: "var is function-scoped; let is block-scoped and reassignable; const is block-scoped and cannot be reassigned.",
    options: [
      { text: "var is function-scoped; let is block-scoped and reassignable; const is block-scoped and cannot be reassigned.", isCorrect: true },
      { text: "const variables can be freely reassigned; let and var are strictly read-only constants.", isCorrect: false },
      { text: "var is block-scoped; let and const are globally scoped and cannot be reassigned.", isCorrect: false },
      { text: "There is no difference in scoping or mutability between let, const, and var.", isCorrect: false }
    ]
  },
  {
    order: 13,
    marks: 2.0,
    text: "Section B (Q13): What are data types? Write any four JavaScript data types with examples.",
    explanation: "Data types specify what kind of value a variable holds: String (\"text\"), Number (42), Boolean (true), and Object ({ id: 1 }).",
    options: [
      { text: "Data types define the nature of data a variable holds; e.g., String (\"text\"), Number (42), Boolean (true), Object ({ id: 1 }).", isCorrect: true },
      { text: "Data types are CSS selectors used for styling web components.", isCorrect: false },
      { text: "JavaScript only supports a single data type: text.", isCorrect: false },
      { text: "Data types are hardware drivers that communicate with browser memory.", isCorrect: false }
    ]
  },
  {
    order: 14,
    marks: 2.0,
    text: "Section B (Q14): Explain the difference between == and === with an example.",
    explanation: "== checks loose equality with type conversion (e.g. 5 == '5' is true); === checks strict equality without type conversion (e.g. 5 === '5' is false).",
    options: [
      { text: "== performs loose equality with type coercion (5 == '5' is true); === checks strict equality without coercion (5 === '5' is false).", isCorrect: true },
      { text: "=== performs loose equality; == checks strict equality.", isCorrect: false },
      { text: "== assigns a value; === evaluates if a variable exists.", isCorrect: false },
      { text: "Both operators perform identical operations with identical output.", isCorrect: false }
    ]
  },
  {
    order: 15,
    marks: 2.0,
    text: "Section B (Q15): Explain the syntax of an if-else statement and a switch statement.",
    explanation: "if-else evaluates boolean condition blocks; switch compares an expression against discrete case clauses.",
    options: [
      { text: "if (condition) { ... } else { ... } evaluates conditional logic; switch (expr) { case val: ... break; default: ... } compares against matched cases.", isCorrect: true },
      { text: "switch statements cannot take numbers or strings; if-else only takes numbers.", isCorrect: false },
      { text: "if-else statements require break after every line; switch statements cannot use break.", isCorrect: false },
      { text: "switch statements do not have a default fallback clause.", isCorrect: false }
    ]
  },

  // --- Section C: Predict the Output (4 Questions × 2 Marks = 8 Marks) ---
  {
    order: 16,
    marks: 2.0,
    text: "Section C (Q16): Predict the output:\nlet a = 10;\nlet b = 3;\nconsole.log(a + b);\nconsole.log(a % b);",
    explanation: "10 + 3 = 13, and 10 % 3 = 1.",
    options: [
      { text: "13 and 1", isCorrect: true },
      { text: "103 and 3", isCorrect: false },
      { text: "13 and 3", isCorrect: false },
      { text: "30 and 1", isCorrect: false }
    ]
  },
  {
    order: 17,
    marks: 2.0,
    text: "Section C (Q17): Predict the output:\nlet x = 5;\nif (x > 10) {\n    console.log(\"Greater\");\n} else {\n    console.log(\"Smaller\");\n}",
    explanation: "Since 5 > 10 is false, the else branch executes, printing 'Smaller'.",
    options: [
      { text: "Smaller", isCorrect: true },
      { text: "Greater", isCorrect: false },
      { text: "undefined", isCorrect: false },
      { text: "Error: comparison failed", isCorrect: false }
    ]
  },
  {
    order: 18,
    marks: 2.0,
    text: "Section C (Q18): Predict the output:\nlet marks = 75;\nif (marks >= 90) {\n    console.log(\"A Grade\");\n} else if (marks >= 60) {\n    console.log(\"B Grade\");\n} else {\n    console.log(\"C Grade\");\n}",
    explanation: "75 is not >= 90, but is >= 60, so 'B Grade' is printed.",
    options: [
      { text: "B Grade", isCorrect: true },
      { text: "A Grade", isCorrect: false },
      { text: "C Grade", isCorrect: false },
      { text: "A Grade and B Grade", isCorrect: false }
    ]
  },
  {
    order: 19,
    marks: 2.0,
    text: "Section C (Q19): Predict the output:\nlet day = 2;\nswitch (day) {\n    case 1:\n        console.log(\"Monday\");\n        break;\n    case 2:\n        console.log(\"Tuesday\");\n        break;\n    default:\n        console.log(\"Invalid Day\");\n}",
    explanation: "day is 2, matching case 2 which logs 'Tuesday' and breaks.",
    options: [
      { text: "Tuesday", isCorrect: true },
      { text: "Monday", isCorrect: false },
      { text: "Invalid Day", isCorrect: false },
      { text: "Tuesday and Invalid Day", isCorrect: false }
    ]
  },

  // --- Section D: Programming Questions (3 Questions × 4 Marks = 12 Marks) ---
  {
    order: 20,
    marks: 4.0,
    text: "Section D (Q20): (4 Marks) Write a JavaScript program to accept two numbers and print their sum, difference, multiplication, and division.\n\nWhich program implementation correctly performs these operations?",
    explanation: "Option A properly parses input as numbers, applies arithmetic operators (+, -, *, /), and prints the outputs.",
    options: [
      { text: "let n1 = parseFloat(prompt(\"Enter first number:\"));\nlet n2 = parseFloat(prompt(\"Enter second number:\"));\nconsole.log(\"Sum: \" + (n1 + n2));\nconsole.log(\"Difference: \" + (n1 - n2));\nconsole.log(\"Multiplication: \" + (n1 * n2));\nconsole.log(\"Division: \" + (n1 / n2));", isCorrect: true },
      { text: "let n1 = prompt(); let n2 = prompt(); console.log(n1 + n2); // concatenates as strings without computing math operations", isCorrect: false },
      { text: "console.print(n1 % n2); console.print(n1 ** n2);", isCorrect: false },
      { text: "Math.compute(num1, num2);", isCorrect: false }
    ]
  },
  {
    order: 21,
    marks: 4.0,
    text: "Section D (Q21): (4 Marks) Write a JavaScript program to check whether a number is positive, negative, or zero using if-else-if.\n\nWhich code snippet accurately solves this?",
    explanation: "Option A accurately checks num > 0 (Positive), num < 0 (Negative), and fallback else (Zero).",
    options: [
      { text: "let num = parseFloat(prompt(\"Enter number:\"));\nif (num > 0) {\n    console.log(\"Positive\");\n} else if (num < 0) {\n    console.log(\"Negative\");\n} else {\n    console.log(\"Zero\");\n}", isCorrect: true },
      { text: "let num = 0;\nif (num == 0) {\n    console.log(\"Positive\");\n} else {\n    console.log(\"Negative\");\n}", isCorrect: false },
      { text: "switch(num) { case positive: console.log(true); }", isCorrect: false },
      { text: "if (num > 0 && num < 0) { console.log(\"Zero\"); }", isCorrect: false }
    ]
  },
  {
    order: 22,
    marks: 4.0,
    text: "Section D (Q22): (4 Marks) Write a JavaScript program using switch to display the day of the week based on a number from 1 to 7. If the number is outside this range, display 'Invalid Day'.\n\nWhich code snippet is the correct implementation?",
    explanation: "Option A covers cases 1 through 7 with corresponding day names and breaks, with a default clause displaying 'Invalid Day'.",
    options: [
      { text: "let dayNum = parseInt(prompt(\"Enter number (1-7):\"));\nswitch (dayNum) {\n    case 1: console.log(\"Monday\"); break;\n    case 2: console.log(\"Tuesday\"); break;\n    case 3: console.log(\"Wednesday\"); break;\n    case 4: console.log(\"Thursday\"); break;\n    case 5: console.log(\"Friday\"); break;\n    case 6: console.log(\"Saturday\"); break;\n    case 7: console.log(\"Sunday\"); break;\n    default: console.log(\"Invalid Day\");\n}", isCorrect: true },
      { text: "switch (dayNum) { case 1 to 7: console.log(\"Valid Day\"); }", isCorrect: false },
      { text: "if (dayNum == 1) { console.log(\"Monday\"); } // lacks remaining days and switch syntax", isCorrect: false },
      { text: "switch (dayNum) { case \"Monday\": console.log(1); }", isCorrect: false }
    ]
  }
];

module.exports = { jsQuestions };
