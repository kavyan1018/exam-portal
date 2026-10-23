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
    explanation: "JavaScript is an interactive client and server-side scripting language used to create dynamic, interactive web pages and backend web applications.",
    options: []
  },
  {
    order: 12,
    marks: 2.0,
    text: "Section B (Q12): Explain the difference between let, const, and var.",
    explanation: "var is function-scoped; let is block-scoped and reassignable; const is block-scoped and cannot be reassigned.",
    options: []
  },
  {
    order: 13,
    marks: 2.0,
    text: "Section B (Q13): What are data types? Write any four JavaScript data types with examples.",
    explanation: "Data types define the nature of data a variable holds; e.g., String (\"text\"), Number (42), Boolean (true), Object ({ id: 1 }).",
    options: []
  },
  {
    order: 14,
    marks: 2.0,
    text: "Section B (Q14): Explain the difference between == and === with an example.",
    explanation: "== performs loose equality with type coercion (5 == '5' is true); === checks strict equality without coercion (5 === '5' is false).",
    options: []
  },
  {
    order: 15,
    marks: 2.0,
    text: "Section B (Q15): Explain the syntax of an if-else statement and a switch statement.",
    explanation: "if (condition) { ... } else { ... } evaluates conditional logic; switch (expr) { case val: ... break; default: ... } compares against matched cases.",
    options: []
  },

  // --- Section C: Predict the Output (4 Questions × 2 Marks = 8 Marks) ---
  {
    order: 16,
    marks: 2.0,
    text: "Section C (Q16): Predict the output:\nlet a = 10;\nlet b = 3;\nconsole.log(a + b);\nconsole.log(a % b);",
    explanation: "13 and 1",
    options: []
  },
  {
    order: 17,
    marks: 2.0,
    text: "Section C (Q17): Predict the output:\nlet x = 5;\nif (x > 10) {\n    console.log(\"Greater\");\n} else {\n    console.log(\"Smaller\");\n}",
    explanation: "Smaller",
    options: []
  },
  {
    order: 18,
    marks: 2.0,
    text: "Section C (Q18): Predict the output:\nlet marks = 75;\nif (marks >= 90) {\n    console.log(\"A Grade\");\n} else if (marks >= 60) {\n    console.log(\"B Grade\");\n} else {\n    console.log(\"C Grade\");\n}",
    explanation: "B Grade",
    options: []
  },
  {
    order: 19,
    marks: 2.0,
    text: "Section C (Q19): Predict the output:\nlet day = 2;\nswitch (day) {\n    case 1:\n        console.log(\"Monday\");\n        break;\n    case 2:\n        console.log(\"Tuesday\");\n        break;\n    default:\n        console.log(\"Invalid Day\");\n}",
    explanation: "Tuesday",
    options: []
  },

  // --- Section D: Programming Questions (3 Questions × 4 Marks = 12 Marks) ---
  {
    order: 20,
    marks: 4.0,
    text: "Section D (Q20): (4 Marks) Write a JavaScript program to accept two numbers and print their sum, difference, multiplication, and division.",
    explanation: "Parse two numbers, calculate +, -, *, /, and output results to console.",
    options: []
  },
  {
    order: 21,
    marks: 4.0,
    text: "Section D (Q21): (4 Marks) Write a JavaScript program to check whether a number is positive, negative, or zero using if-else-if.",
    explanation: "Use if (num > 0) Positive else if (num < 0) Negative else Zero.",
    options: []
  },
  {
    order: 22,
    marks: 4.0,
    text: "Section D (Q22): (4 Marks) Write a JavaScript program using switch to display the day of the week based on a number from 1 to 7. If the number is outside this range, display 'Invalid Day'.",
    explanation: "Switch statement with cases 1 through 7 mapping to Monday through Sunday, and default Invalid Day.",
    options: []
  }
];

module.exports = { jsQuestions };
