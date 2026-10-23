const fs = require('fs');

const questions = [
  // --- SECTION A: MCQs (Q1 to Q20) - 1 Mark each ---
  {
    order: 1,
    marks: 1.0,
    text: "Section A (Q1): Which CSS property changes the text color?",
    explanation: "The 'color' property is used in CSS to set the color of text.",
    options: [
      { text: "font-color", isCorrect: false },
      { text: "color", isCorrect: true },
      { text: "text-color", isCorrect: false },
      { text: "background-color", isCorrect: false }
    ]
  },
  {
    order: 2,
    marks: 1.0,
    text: "Section A (Q2): Which property creates space inside an element's border?",
    explanation: "padding creates internal spacing between the element's content and its border.",
    options: [
      { text: "margin", isCorrect: false },
      { text: "padding", isCorrect: true },
      { text: "spacing", isCorrect: false },
      { text: "gap", isCorrect: false }
    ]
  },
  {
    order: 3,
    marks: 1.0,
    text: "Section A (Q3): Which selector targets an element with the ID 'header'?",
    explanation: "IDs are targeted in CSS using the hash (#) character followed by the ID name.",
    options: [
      { text: ".header", isCorrect: false },
      { text: "#header", isCorrect: true },
      { text: "header#", isCorrect: false },
      { text: "*header", isCorrect: false }
    ]
  },
  {
    order: 4,
    marks: 1.0,
    text: "Section A (Q4): Which property creates rounded corners?",
    explanation: "The border-radius property rounds the corners of an element's outer border edge.",
    options: [
      { text: "border-style", isCorrect: false },
      { text: "corner-radius", isCorrect: false },
      { text: "border-radius", isCorrect: true },
      { text: "radius", isCorrect: false }
    ]
  },
  {
    order: 5,
    marks: 1.0,
    text: "Section A (Q5): Which position value fixes an element relative to the viewport?",
    explanation: "position: fixed keeps an element in the exact same position relative to the browser viewport even during scrolling.",
    options: [
      { text: "static", isCorrect: false },
      { text: "relative", isCorrect: false },
      { text: "absolute", isCorrect: false },
      { text: "fixed", isCorrect: true }
    ]
  },
  {
    order: 6,
    marks: 1.0,
    text: "Section A (Q6): Which property controls an element's transparency?",
    explanation: "opacity defines the degree of transparency of an element from 0.0 (fully transparent) to 1.0 (fully opaque).",
    options: [
      { text: "visibility", isCorrect: false },
      { text: "opacity", isCorrect: true },
      { text: "transparent", isCorrect: false },
      { text: "display", isCorrect: false }
    ]
  },
  {
    order: 7,
    marks: 1.0,
    text: "Section A (Q7): Which function creates a linear gradient?",
    explanation: "linear-gradient() creates an image consisting of a progressive transition between two or more colors along a straight line.",
    options: [
      { text: "linear-color()", isCorrect: false },
      { text: "gradient()", isCorrect: false },
      { text: "linear-gradient()", isCorrect: true },
      { text: "background-gradient()", isCorrect: false }
    ]
  },
  {
    order: 8,
    marks: 1.0,
    text: "Section A (Q8): Which pseudo-class applies when the mouse pointer is over an element?",
    explanation: "The :hover pseudo-class activates when the user hovers over an element with a pointer device.",
    options: [
      { text: "::before", isCorrect: false },
      { text: ":active", isCorrect: false },
      { text: ":hover", isCorrect: true },
      { text: ":focus-within", isCorrect: false }
    ]
  },
  {
    order: 9,
    marks: 1.0,
    text: "Section A (Q9): Which property controls content that exceeds an element's dimensions?",
    explanation: "The overflow property specifies whether to clip content or add scrollbars when an element's content is too big to fit.",
    options: [
      { text: "display", isCorrect: false },
      { text: "overflow", isCorrect: true },
      { text: "position", isCorrect: false },
      { text: "visibility", isCorrect: false }
    ]
  },
  {
    order: 10,
    marks: 1.0,
    text: "Section A (Q10): Which property creates smooth changes between CSS property values?",
    explanation: "The transition property provides a way to control animation speed when changing CSS properties.",
    options: [
      { text: "transition", isCorrect: true },
      { text: "transform-only", isCorrect: false },
      { text: "change", isCorrect: false },
      { text: "motion", isCorrect: false }
    ]
  },
  {
    order: 11,
    marks: 1.0,
    text: "Section A (Q11): Which property specifies the duration of an animation?",
    explanation: "animation-duration defines how long an animation cycle takes to complete.",
    options: [
      { text: "animation-speed", isCorrect: false },
      { text: "animation-time", isCorrect: false },
      { text: "animation-duration", isCorrect: true },
      { text: "transition-delay", isCorrect: false }
    ]
  },
  {
    order: 12,
    marks: 1.0,
    text: "Section A (Q12): Which CSS rule applies styles based on screen dimensions?",
    explanation: "@media at-rules (media queries) conditionally apply CSS based on device viewport width, height, resolution, etc.",
    options: [
      { text: "@font-face", isCorrect: false },
      { text: "@media", isCorrect: true },
      { text: "@keyframes", isCorrect: false },
      { text: "@import", isCorrect: false }
    ]
  },
  {
    order: 13,
    marks: 1.0,
    text: "Section A (Q13): Which declaration creates a flex container?",
    explanation: "display: flex transforms an element into a block-level flex container.",
    options: [
      { text: "display: block-flex;", isCorrect: false },
      { text: "display: flex;", isCorrect: true },
      { text: "display: inline;", isCorrect: false },
      { text: "display: flexbox;", isCorrect: false }
    ]
  },
  {
    order: 14,
    marks: 1.0,
    text: "Section A (Q14): Which property controls the stacking order of positioned elements?",
    explanation: "z-index specifies the stack level of positioned elements along the 3D z-axis.",
    options: [
      { text: "order", isCorrect: false },
      { text: "stack", isCorrect: false },
      { text: "z-index", isCorrect: true },
      { text: "layer-index", isCorrect: false }
    ]
  },
  {
    order: 15,
    marks: 1.0,
    text: "Section A (Q15): Which pseudo-element inserts generated content before an element's content?",
    explanation: "::before creates a pseudo-element that is the first child of the selected element, often paired with content: ''.",
    options: [
      { text: ":hover", isCorrect: false },
      { text: "::before", isCorrect: true },
      { text: "::first", isCorrect: false },
      { text: ":active", isCorrect: false }
    ]
  },
  {
    order: 16,
    marks: 1.0,
    text: "Section A (Q16): What does box-sizing: border-box do?",
    explanation: "border-box includes padding and border within the element's total declared width and height.",
    options: [
      { text: "Removes the border.", isCorrect: false },
      { text: "Includes padding and border within the specified width and height.", isCorrect: true },
      { text: "Adds extra margin.", isCorrect: false },
      { text: "Changes the element into a flex container.", isCorrect: false }
    ]
  },
  {
    order: 17,
    marks: 1.0,
    text: "Section A (Q17): Which property controls the spacing between letters?",
    explanation: "letter-spacing increases or decreases the space between characters in a text.",
    options: [
      { text: "word-spacing", isCorrect: false },
      { text: "line-height", isCorrect: false },
      { text: "letter-spacing", isCorrect: true },
      { text: "text-indent", isCorrect: false }
    ]
  },
  {
    order: 18,
    marks: 1.0,
    text: "Section A (Q18): Which property combines border width, style, and color?",
    explanation: "border is the shorthand property for border-width, border-style, and border-color.",
    options: [
      { text: "outline", isCorrect: false },
      { text: "border", isCorrect: true },
      { text: "box-shadow", isCorrect: false },
      { text: "border-color", isCorrect: false }
    ]
  },
  {
    order: 19,
    marks: 1.0,
    text: "Section A (Q19): Which CSS rule defines animation stages?",
    explanation: "@keyframes defines the stages and styles of a CSS animation sequence.",
    options: [
      { text: "@media", isCorrect: false },
      { text: "@import", isCorrect: false },
      { text: "@keyframes", isCorrect: true },
      { text: "@supports", isCorrect: false }
    ]
  },
  {
    order: 20,
    marks: 1.0,
    text: "Section A (Q20): Which selector targets every paragraph inside a <div>, including nested descendants?",
    explanation: "The descendant combinator (space) 'div p' matches all <p> elements that are descendants of a <div>.",
    options: [
      { text: "div + p", isCorrect: false },
      { text: "div > p", isCorrect: false },
      { text: "div p", isCorrect: true },
      { text: "div, p", isCorrect: false }
    ]
  },

  // --- SECTION B: Short Answer Questions (Q21 to Q30) - 2 Marks each ---
  {
    order: 21,
    marks: 2.0,
    text: "Section B (Q21): Differentiate between margin and padding.",
    explanation: "Margin provides clearance around the outside of an element's border, whereas padding creates interior clearance between the content and the border.",
    options: [
      { text: "Margin creates space outside the element border; Padding creates space inside the element border.", isCorrect: true },
      { text: "Margin creates space inside the border; Padding creates space outside the border.", isCorrect: false },
      { text: "Margin applies only to inline tags; Padding applies only to block tags.", isCorrect: false },
      { text: "Margin controls font sizing; Padding controls line height.", isCorrect: false }
    ]
  },
  {
    order: 22,
    marks: 2.0,
    text: "Section B (Q22): Explain the difference between class selectors and ID selectors.",
    explanation: "Class selectors (.) can be assigned to multiple elements on a page, while ID selectors (#) must be strictly unique to one element per document.",
    options: [
      { text: "Class selectors start with '.' and can be reused on multiple elements; ID selectors start with '#' and must be unique per page.", isCorrect: true },
      { text: "Class selectors start with '#' and are unique; ID selectors start with '.' and are reusable.", isCorrect: false },
      { text: "Class selectors have higher specificity than ID selectors.", isCorrect: false },
      { text: "Class selectors only style text; ID selectors only style containers.", isCorrect: false }
    ]
  },
  {
    order: 23,
    marks: 2.0,
    text: "Section B (Q23): Differentiate between display: none and visibility: hidden.",
    explanation: "display: none removes the element completely from document flow taking up 0 space, while visibility: hidden hides the element visually but preserves its original box layout space.",
    options: [
      { text: "display: none removes the element from document layout flow; visibility: hidden hides it while preserving its space.", isCorrect: true },
      { text: "visibility: hidden removes the element from layout; display: none keeps its space.", isCorrect: false },
      { text: "Both completely remove the element and its physical space from the document.", isCorrect: false },
      { text: "display: none only works on images; visibility: hidden works only on text.", isCorrect: false }
    ]
  },
  {
    order: 24,
    marks: 2.0,
    text: "Section B (Q24): Explain the difference between transition and animation.",
    explanation: "A transition interpolates property values between two states when triggered (e.g. :hover), whereas an animation uses @keyframes for multi-stage keyframe animations that can run autonomously.",
    options: [
      { text: "transition smoothly transitions between two states on trigger; animation uses @keyframes for multi-step automated sequences.", isCorrect: true },
      { text: "transition uses @keyframes; animation only transitions between two states on hover.", isCorrect: false },
      { text: "transition can only animate color; animation can only animate dimensions.", isCorrect: false },
      { text: "There is no functional difference; they are aliases for the same CSS property.", isCorrect: false }
    ]
  },
  {
    order: 25,
    marks: 2.0,
    text: "Section B (Q25): What is the purpose of media queries in responsive web design?",
    explanation: "Media queries allow CSS rules to be applied conditionally depending on device characteristics like viewport width, resolution, and orientation.",
    options: [
      { text: "To apply different CSS styles based on device characteristics like screen width, orientation, and resolution.", isCorrect: true },
      { text: "To query backend SQL databases for media files.", isCorrect: false },
      { text: "To compress image and video files for mobile loading.", isCorrect: false },
      { text: "To execute JavaScript scripts when the window resizes.", isCorrect: false }
    ]
  },
  {
    order: 26,
    marks: 2.0,
    text: "Section B (Q26): Differentiate between opacity: 0 and display: none.",
    explanation: "opacity: 0 renders the element invisible while preserving its layout dimensions and pointer click events; display: none removes it from the layout flow entirely and disables interactions.",
    options: [
      { text: "opacity: 0 hides the element visually while retaining layout space and click events; display: none completely removes it from document flow.", isCorrect: true },
      { text: "opacity: 0 removes the element from document layout; display: none keeps it clickable.", isCorrect: false },
      { text: "Both remove the element entirely from the DOM tree.", isCorrect: false },
      { text: "opacity: 0 only works on desktop browsers; display: none works on mobile.", isCorrect: false }
    ]
  },
  {
    order: 27,
    marks: 2.0,
    text: "Section B (Q27): Explain the difference between :hover and ::before.",
    explanation: ":hover is a pseudo-class reflecting user interaction state; ::before is a pseudo-element creating an inline element before the target element's content.",
    options: [
      { text: ":hover is a pseudo-class targeting user interaction state; ::before is a pseudo-element generating content before element content.", isCorrect: true },
      { text: ":hover is a pseudo-element; ::before is a pseudo-class.", isCorrect: false },
      { text: "Both insert content before an element when clicked.", isCorrect: false },
      { text: ":hover only applies to links; ::before applies only to headings.", isCorrect: false }
    ]
  },
  {
    order: 28,
    marks: 2.0,
    text: "Section B (Q28): Explain the difference between overflow: hidden and overflow: scroll.",
    explanation: "overflow: hidden clips any content that exceeds container boundaries without scrollbars; overflow: scroll clips content and permanently shows scrollbars.",
    options: [
      { text: "overflow: hidden clips excess content with no scrollbars; overflow: scroll clips content and always displays scrollbars.", isCorrect: true },
      { text: "overflow: scroll hides overflowing content; overflow: hidden forces scrollbars.", isCorrect: false },
      { text: "overflow: hidden automatically expands container height to fit all content.", isCorrect: false },
      { text: "Neither property has any effect on overflowing child elements.", isCorrect: false }
    ]
  },
  {
    order: 29,
    marks: 2.0,
    text: "Section B (Q29): Differentiate between linear gradients and radial gradients with syntax.",
    explanation: "linear-gradient(direction, color1, color2) transitions along a straight line axis; radial-gradient(shape at position, color1, color2) radiates outward from an origin point.",
    options: [
      { text: "linear-gradient(direction, c1, c2) transitions along a straight line; radial-gradient(shape at pos, c1, c2) radiates outward from a center point.", isCorrect: true },
      { text: "radial-gradient transitions along a straight line; linear-gradient transitions outward in a circle.", isCorrect: false },
      { text: "linear-gradient only accepts two colors; radial-gradient requires 10 colors.", isCorrect: false },
      { text: "Gradients are defined using @gradient at-rules rather than CSS functions.", isCorrect: false }
    ]
  },
  {
    order: 30,
    marks: 2.0,
    text: "Section B (Q30): Explain the difference between position: relative and position: absolute.",
    explanation: "position: relative offsets an element relative to its normal position while preserving its original space; position: absolute removes it from document flow and positions it relative to its nearest positioned ancestor.",
    options: [
      { text: "relative offsets an element relative to its normal flow while preserving its space; absolute removes it from flow relative to its nearest positioned ancestor.", isCorrect: true },
      { text: "absolute positions relative to normal flow; relative removes the element from flow.", isCorrect: false },
      { text: "relative can only be used on the body element.", isCorrect: false },
      { text: "absolute locks the element to the viewport regardless of scrolling.", isCorrect: false }
    ]
  },

  // --- SECTION C: CSS Coding Questions (Q31 to Q34) - 5 Marks each ---
  {
    order: 31,
    marks: 5.0,
    text: "Section C (Q31): Background and Border Design — 5 Marks\nCreate a card with the following requirements:\n- Width: 300px and height: 200px\n- Apply a linear-gradient background\n- Add a 2px solid blue border\n- Set border-radius to 15px\n- Include a heading and paragraph inside the card.\n\nWhich CSS rule correctly satisfies ALL specifications?",
    explanation: "Setting width: 300px, height: 200px, background: linear-gradient(...), border: 2px solid blue, and border-radius: 15px fulfills all card requirements.",
    options: [
      { text: ".card { width: 300px; height: 200px; background: linear-gradient(135deg, #f0f4f8, #d9e2ec); border: 2px solid blue; border-radius: 15px; }", isCorrect: true },
      { text: ".card { max-width: 300px; min-height: 200px; background: blue; border: 15px solid blue; border-radius: 2px; }", isCorrect: false },
      { text: ".card { width: 200px; height: 300px; background: radial-gradient(circle, blue, white); border: 2px dashed blue; border-radius: 15px; }", isCorrect: false },
      { text: ".card { width: 300px; height: 200px; background: linear-gradient(#fff, #000); outline: 2px solid blue; border-radius: 0px; }", isCorrect: false }
    ]
  },
  {
    order: 32,
    marks: 5.0,
    text: "Section C (Q32): Navigation Bar Using Display — 5 Marks\nCreate a horizontal navigation bar containing Home, About, Services, Courses, and Contact.\nRequirements:\n- Use display: flex\n- Remove default list markers and link underlines\n- Add background color and padding\n- Apply a hover effect to the links.\n\nWhich CSS implementation correctly satisfies all requirements?",
    explanation: "display: flex lays out items horizontally; list-style: none removes bullet points; text-decoration: none removes underlines; background and hover state complete the navbar requirements.",
    options: [
      { text: ".navbar { display: flex; background: #1e293b; padding: 1rem 2rem; list-style: none; } .navbar a { text-decoration: none; color: #fff; padding: 0.5rem 1rem; } .navbar a:hover { background: #3b82f6; border-radius: 4px; }", isCorrect: true },
      { text: ".navbar { display: block; background: #1e293b; list-style: disc; } .navbar a { text-decoration: underline; }", isCorrect: false },
      { text: ".navbar { display: inline; padding: 0; } .navbar a:hover { display: none; }", isCorrect: false },
      { text: ".navbar { float: left; list-style: square; } .navbar a { text-decoration: line-through; }", isCorrect: false }
    ]
  },
  {
    order: 33,
    marks: 5.0,
    text: "Section C (Q33): Transition and Hover Effect — 5 Marks\nCreate a button with these features:\n- Initial background color: blue\n- Initial width: 150px\n- On hover, change background color to green\n- Increase width to 200px\n- Use a smooth transition of 0.5 seconds.\n\nWhich CSS code correctly implements this behavior?",
    explanation: "The initial state sets width: 150px, background: blue, and transition: width 0.5s ease, background-color 0.5s ease. The :hover selector updates width: 200px and background: green.",
    options: [
      { text: ".btn { width: 150px; background-color: blue; transition: width 0.5s ease, background-color 0.5s ease; } .btn:hover { width: 200px; background-color: green; }", isCorrect: true },
      { text: ".btn { width: 200px; background-color: green; } .btn:hover { width: 150px; background-color: blue; transition-delay: 5s; }", isCorrect: false },
      { text: ".btn { width: 150px; background-color: blue; } .btn:active { width: 200px; background-color: green; animation: hover 0.5s; }", isCorrect: false },
      { text: ".btn { width: 150px; background-color: blue; transform: scale(2); }", isCorrect: false }
    ]
  },
  {
    order: 34,
    marks: 5.0,
    text: "Section C (Q34): Overflow and Opacity — 5 Marks\nCreate a box with the following requirements:\n- Width: 250px and height: 100px\n- Add paragraph text exceeding box dimensions\n- Apply overflow: auto\n- Add an image or placeholder with opacity: 0.5.\n\nWhich CSS snippet correctly implements these features?",
    explanation: "width: 250px, height: 100px, overflow: auto adds scrollbars when text overflows, and opacity: 0.5 provides 50% transparency on the image.",
    options: [
      { text: ".box { width: 250px; height: 100px; overflow: auto; } .box img { opacity: 0.5; }", isCorrect: true },
      { text: ".box { width: 100px; height: 250px; overflow: hidden; } .box img { opacity: 5; }", isCorrect: false },
      { text: ".box { max-width: 250px; overflow: visible; } .box img { visibility: hidden; }", isCorrect: false },
      { text: ".box { width: 250px; height: 100px; overflow: none; } .box img { opacity: -0.5; }", isCorrect: false }
    ]
  },

  // --- SECTION D: Practical CSS Questions (Q35 to Q36) - 10 Marks each ---
  {
    order: 35,
    marks: 10.0,
    text: "Section D (Q35): CSS Animation Using Keyframes — 10 Marks\nCreate a webpage containing a square box with the following requirements:\n1. Box dimensions: 100px × 100px\n2. Initial background color: red\n3. Use @keyframes to move the box horizontally by 300px\n4. Change box color from red to blue during animation\n5. Animation duration: 4 seconds\n6. Repeat animation infinitely\n7. Apply animation-direction: alternate\n8. Use suitable animation timing function.\n\nWhich CSS rule correctly implements the complete animation?",
    explanation: "Option A properly sets dimensions (100px x 100px), red background, 4s duration, alternate infinite loop, and @keyframes moving translateX(300px) and turning blue.",
    options: [
      { text: ".box { width: 100px; height: 100px; background-color: red; animation: moveAndColor 4s ease-in-out infinite alternate; } @keyframes moveAndColor { 0% { transform: translateX(0); background-color: red; } 100% { transform: translateX(300px); background-color: blue; } }", isCorrect: true },
      { text: ".box { width: 100px; height: 100px; background-color: red; animation: move 4s forwards; } @keyframes move { from { margin-left: 0; } to { margin-left: 300px; background-color: green; } }", isCorrect: false },
      { text: ".box { width: 300px; height: 300px; background-color: blue; transition: transform 4s alternate infinite; }", isCorrect: false },
      { text: ".box { width: 100px; height: 100px; animation-duration: 4s; animation-iteration-count: 1; animation-direction: reverse; }", isCorrect: false }
    ]
  },
  {
    order: 36,
    marks: 10.0,
    text: "Section D (Q36): Responsive Design Using Media Queries — 10 Marks\nCreate a webpage containing three course cards with the following requirements:\n1. Display all 3 cards in one row on screens wider than 768px\n2. Display the cards in one column on screens 768px wide or smaller\n3. Give each card a border, padding, background color, and rounded corners\n4. Add a hover effect to each card\n5. Use Flexbox and @media queries\n6. Prevent horizontal overflow on mobile screens.\n\nWhich complete CSS implementation accurately satisfies all criteria?",
    explanation: "Flexbox row layout with @media (max-width: 768px) { flex-direction: column; } adapts the cards cleanly from desktop row to mobile column without overflow, accompanied by border, padding, and hover transitions.",
    options: [
      { text: ".container { display: flex; flex-direction: row; gap: 1.5rem; width: 100%; box-sizing: border-box; } .card { flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; transition: transform 0.3s ease; } .card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); } @media (max-width: 768px) { .container { flex-direction: column; } }", isCorrect: true },
      { text: ".container { display: block; } .card { width: 1000px; overflow-x: scroll; } @media (min-width: 768px) { .container { display: none; } }", isCorrect: false },
      { text: ".container { display: flex; flex-direction: column; } @media (max-width: 768px) { .container { flex-direction: row; width: 200vw; } }", isCorrect: false },
      { text: ".container { float: left; } .card { border-radius: 50%; position: absolute; }", isCorrect: false }
    ]
  },

  // --- SECTION E: CSS Design Challenge (Q37) - 20 Marks ---
  {
    order: 37,
    marks: 20.0,
    text: "Section E (Q37): Create a Complete Responsive Course Landing Page — 20 Marks\nDevelop a complete course landing page using HTML and CSS covering all 5 architectural modules:\nA. Navigation Bar (4 Marks): Website logo, Home, Courses, About, Contact links, styled with spacing and responsive alignment\nB. Hero Section (4 Marks): Heading 'Learn Programming with Us', short description, CTA button, and linear-gradient background\nC. Course Cards (4 Marks): Three cards (Web Development, Java Programming, Python Programming) with heading, description, button\nD. CSS Effects (4 Marks): Hover effects, smooth transitions, rounded corners, box shadows, clean typography\nE. Responsive Design (4 Marks): At least one @media query adapting layout for mobile devices, preventing horizontal overflow.\n\nWhich CSS codebase best implements all 5 required modules conforming to production standards?",
    explanation: "Option A provides the comprehensive, production-ready stylesheet with all 5 modules: flex navbar, gradient hero with interactive CTA, flex course cards with hover shadows and transitions, and a mobile @media breakpoint.",
    options: [
      { text: "/* Responsive Landing Page */ .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #0f172a; color: #fff; } .nav-links { display: flex; gap: 1.5rem; list-style: none; } .nav-links a { color: #e2e8f0; text-decoration: none; transition: color 0.3s; } .nav-links a:hover { color: #38bdf8; } .hero { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #fff; padding: 4rem 2rem; text-align: center; } .hero h1 { font-size: 2.5rem; margin-bottom: 1rem; } .cta-btn { background: #f59e0b; color: #000; padding: 0.75rem 1.75rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.3s; } .cta-btn:hover { transform: scale(1.05); } .courses-container { display: flex; gap: 2rem; padding: 3rem 2rem; max-width: 1200px; margin: 0 auto; } .course-card { flex: 1; background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s; } .course-card:hover { transform: translateY(-8px); } @media (max-width: 768px) { .navbar, .nav-links { flex-direction: column; gap: 1rem; text-align: center; } .courses-container { flex-direction: column; } }", isCorrect: true },
      { text: "/* Broken desktop layout */ .navbar { width: 1400px; } .hero { background: yellow; width: 1400px; } .courses-container { width: 1400px; overflow-x: scroll; } /* No responsive media queries */", isCorrect: false },
      { text: "/* Incomplete rules */ .navbar, .hero, .courses-container { display: none; }", isCorrect: false },
      { text: "body { margin: 0; font-family: sans-serif; } .course-card { border: 1px solid black; } @media (min-width: 768px) { .courses-container { display: flex; } }", isCorrect: false }
    ]
  }
];

module.exports = { questions };
