const questions = [
  {
    order: 1,
    marks: 1,
    text: "Which index is used to access the first element of an array in C?",
    explanation: "In C, arrays are zero-indexed, meaning the first element is at index 0.",
    options: [
      { text: "1", isCorrect: false },
      { text: "0", isCorrect: true },
      { text: "-1", isCorrect: false },
      { text: "n", isCorrect: false }
    ]
  },
  {
    order: 2,
    marks: 1,
    text: "Which data structure stores elements of the same data type in contiguous memory locations?",
    explanation: "An array is a collection of elements of the same data type placed in contiguous memory locations.",
    options: [
      { text: "Stack", isCorrect: false },
      { text: "Queue", isCorrect: false },
      { text: "Array", isCorrect: true },
      { text: "Graph", isCorrect: false }
    ]
  },
  {
    order: 3,
    marks: 1,
    text: "What is the index of the last element in an array of size 10 in C?",
    explanation: "Since C arrays start at index 0, an array of size 10 has indices 0 through 9.",
    options: [
      { text: "10", isCorrect: false },
      { text: "9", isCorrect: true },
      { text: "11", isCorrect: false },
      { text: "0", isCorrect: false }
    ]
  },
  {
    order: 4,
    marks: 1,
    text: "What is the time complexity of accessing an array element by index?",
    explanation: "Direct index-based lookup in an array takes constant time O(1).",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(log n)", isCorrect: false },
      { text: "O(1)", isCorrect: true },
      { text: "O(n²)", isCorrect: false }
    ]
  },
  {
    order: 5,
    marks: 1,
    text: "What happens when an array is accessed using an invalid index?",
    explanation: "In C, accessing an out-of-bounds array index leads to undefined behavior.",
    options: [
      { text: "Always returns zero", isCorrect: false },
      { text: "Undefined behavior may occur", isCorrect: true },
      { text: "Array resizes automatically", isCorrect: false },
      { text: "Program always restarts", isCorrect: false }
    ]
  },
  {
    order: 6,
    marks: 1,
    text: "Which operation adds a new element at the end of a normal array with available capacity?",
    explanation: "Adding a new element into an array is known as insertion.",
    options: [
      { text: "Insertion", isCorrect: true },
      { text: "Deletion", isCorrect: false },
      { text: "Searching", isCorrect: false },
      { text: "Sorting", isCorrect: false }
    ]
  },
  {
    order: 7,
    marks: 1,
    text: "Which searching algorithm checks elements one by one?",
    explanation: "Linear Search examines each element in sequence until the target is found or the end is reached.",
    options: [
      { text: "Binary Search", isCorrect: false },
      { text: "Linear Search", isCorrect: true },
      { text: "Merge Sort", isCorrect: false },
      { text: "Selection Sort", isCorrect: false }
    ]
  },
  {
    order: 8,
    marks: 1,
    text: "Which algorithm requires sorted data to work correctly?",
    explanation: "Binary Search requires sorted elements to divide the search interval in half at each step.",
    options: [
      { text: "Linear Search", isCorrect: false },
      { text: "Binary Search", isCorrect: true },
      { text: "Bubble Sort", isCorrect: false },
      { text: "Insertion Sort", isCorrect: false }
    ]
  },
  {
    order: 9,
    marks: 1,
    text: "What is the worst-case time complexity of Linear Search?",
    explanation: "In the worst case, Linear Search must check all n elements, taking O(n) time.",
    options: [
      { text: "O(1)", isCorrect: false },
      { text: "O(log n)", isCorrect: false },
      { text: "O(n)", isCorrect: true },
      { text: "O(n²)", isCorrect: false }
    ]
  },
  {
    order: 10,
    marks: 1,
    text: "What is the time complexity of Binary Search in the worst case?",
    explanation: "Binary search cuts the search space in half at each step, resulting in O(log n) time complexity.",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(log n)", isCorrect: true },
      { text: "O(n²)", isCorrect: false },
      { text: "O(1)", isCorrect: false }
    ]
  },
  {
    order: 11,
    marks: 1,
    text: "In Binary Search, which element is checked first?",
    explanation: "Binary Search always starts by comparing the target with the middle element of the sorted array.",
    options: [
      { text: "First element", isCorrect: false },
      { text: "Last element", isCorrect: false },
      { text: "Middle element", isCorrect: true },
      { text: "Random element", isCorrect: false }
    ]
  },
  {
    order: 12,
    marks: 1,
    text: "If a target is not present in a Linear Search array, what happens?",
    explanation: "The search algorithm traverses the entire array from start to end before determining the element is not found.",
    options: [
      { text: "The search continues until all elements are checked", isCorrect: true },
      { text: "The array is sorted", isCorrect: false },
      { text: "The target is inserted automatically", isCorrect: false },
      { text: "The first element is returned", isCorrect: false }
    ]
  },
  {
    order: 13,
    marks: 1,
    text: "Which sorting algorithm repeatedly compares adjacent elements?",
    explanation: "Bubble Sort repeatedly steps through the list, compares adjacent items, and swaps them if they are out of order.",
    options: [
      { text: "Selection Sort", isCorrect: false },
      { text: "Bubble Sort", isCorrect: true },
      { text: "Binary Search", isCorrect: false },
      { text: "Linear Search", isCorrect: false }
    ]
  },
  {
    order: 14,
    marks: 1,
    text: "Which sorting algorithm selects the smallest element from the unsorted portion?",
    explanation: "Selection Sort finds the minimum element from the unsorted sub-array and swaps it to the front.",
    options: [
      { text: "Bubble Sort", isCorrect: false },
      { text: "Selection Sort", isCorrect: true },
      { text: "Binary Search", isCorrect: false },
      { text: "Linear Search", isCorrect: false }
    ]
  },
  {
    order: 15,
    marks: 1,
    text: "What is the typical worst-case time complexity of Bubble Sort?",
    explanation: "Bubble Sort requires n(n-1)/2 comparisons in the worst case, giving O(n²) complexity.",
    options: [
      { text: "O(1)", isCorrect: false },
      { text: "O(log n)", isCorrect: false },
      { text: "O(n)", isCorrect: false },
      { text: "O(n²)", isCorrect: true }
    ]
  },
  {
    order: 16,
    marks: 1,
    text: "What is the typical time complexity of Selection Sort?",
    explanation: "Selection Sort always performs nested loops regardless of input order, taking O(n²) time.",
    options: [
      { text: "O(n²)", isCorrect: true },
      { text: "O(log n)", isCorrect: false },
      { text: "O(n)", isCorrect: false },
      { text: "O(1)", isCorrect: false }
    ]
  },
  {
    order: 17,
    marks: 1,
    text: "How many comparisons are needed in the first pass of Bubble Sort for 5 elements?",
    explanation: "The first pass compares index 0-1, 1-2, 2-3, and 3-4, totaling n - 1 = 4 comparisons.",
    options: [
      { text: "3", isCorrect: false },
      { text: "4", isCorrect: true },
      { text: "5", isCorrect: false },
      { text: "6", isCorrect: false }
    ]
  },
  {
    order: 18,
    marks: 1,
    text: "What is the main purpose of sorting?",
    explanation: "Sorting arranges elements in a specified monotonic order (ascending or descending).",
    options: [
      { text: "To arrange data in a specified order", isCorrect: true },
      { text: "To delete every duplicate", isCorrect: false },
      { text: "To increase array size", isCorrect: false },
      { text: "To search without comparisons", isCorrect: false }
    ]
  },
  {
    order: 19,
    marks: 1,
    text: "Which of these is a valid sorting order?",
    explanation: "Both ascending (increasing) and descending (decreasing) are valid sorting orders.",
    options: [
      { text: "Ascending", isCorrect: false },
      { text: "Descending", isCorrect: false },
      { text: "Both ascending and descending", isCorrect: true },
      { text: "Neither", isCorrect: false }
    ]
  },
  {
    order: 20,
    marks: 1,
    text: "After one full pass of standard Bubble Sort in ascending order, which element is generally at the end?",
    explanation: "The largest element bubbles up to the last position after the first complete pass.",
    options: [
      { text: "Smallest element", isCorrect: false },
      { text: "Middle element", isCorrect: false },
      { text: "Largest element", isCorrect: true },
      { text: "First element", isCorrect: false }
    ]
  },
  {
    order: 21,
    marks: 1,
    text: "Which principle does a stack follow?",
    explanation: "A stack is a Last-In, First-Out (LIFO) data structure.",
    options: [
      { text: "FIFO", isCorrect: false },
      { text: "LIFO", isCorrect: true },
      { text: "Random order", isCorrect: false },
      { text: "Priority only", isCorrect: false }
    ]
  },
  {
    order: 22,
    marks: 1,
    text: "Which operation inserts an element into a stack?",
    explanation: "The push operation inserts a new item onto the top of the stack.",
    options: [
      { text: "Pop", isCorrect: false },
      { text: "Push", isCorrect: true },
      { text: "Dequeue", isCorrect: false },
      { text: "Search", isCorrect: false }
    ]
  },
  {
    order: 23,
    marks: 1,
    text: "Which operation removes the top element from a stack?",
    explanation: "The pop operation removes and returns the most recently inserted (top) element.",
    options: [
      { text: "Push", isCorrect: false },
      { text: "Enqueue", isCorrect: false },
      { text: "Pop", isCorrect: true },
      { text: "Peek", isCorrect: false }
    ]
  },
  {
    order: 24,
    marks: 1,
    text: "What is stack overflow?",
    explanation: "Stack overflow occurs when attempting to push an element onto a stack that has reached maximum capacity.",
    options: [
      { text: "Removing from an empty stack", isCorrect: false },
      { text: "Pushing onto a full stack", isCorrect: true },
      { text: "Viewing the top element", isCorrect: false },
      { text: "Sorting the stack", isCorrect: false }
    ]
  },
  {
    order: 25,
    marks: 1,
    text: "What is stack underflow?",
    explanation: "Stack underflow occurs when trying to pop or peek an element from an empty stack.",
    options: [
      { text: "Pushing into a full stack", isCorrect: false },
      { text: "Removing from an empty stack", isCorrect: true },
      { text: "Adding to a queue", isCorrect: false },
      { text: "Searching an array", isCorrect: false }
    ]
  },
  {
    order: 26,
    marks: 1,
    text: "Which operation reads the top stack element without removing it?",
    explanation: "The peek (or top) operation inspects the top item without altering stack contents.",
    options: [
      { text: "Pop", isCorrect: false },
      { text: "Push", isCorrect: false },
      { text: "Peek", isCorrect: true },
      { text: "Enqueue", isCorrect: false }
    ]
  },
  {
    order: 27,
    marks: 1,
    text: "Which data structure is commonly used to manage function calls?",
    explanation: "The call stack (Stack) keeps track of active subroutines, return addresses, and local variables.",
    options: [
      { text: "Queue", isCorrect: false },
      { text: "Stack", isCorrect: true },
      { text: "Array only", isCorrect: false },
      { text: "Graph", isCorrect: false }
    ]
  },
  {
    order: 28,
    marks: 1,
    text: "Which principle does a queue follow?",
    explanation: "A standard queue operates on a First-In, First-Out (FIFO) basis.",
    options: [
      { text: "LIFO", isCorrect: false },
      { text: "FIFO", isCorrect: true },
      { text: "FILO", isCorrect: false },
      { text: "Random access", isCorrect: false }
    ]
  },
  {
    order: 29,
    marks: 1,
    text: "Which operation inserts an element into a queue?",
    explanation: "The enqueue operation appends an item to the rear of the queue.",
    options: [
      { text: "Dequeue", isCorrect: false },
      { text: "Pop", isCorrect: false },
      { text: "Enqueue", isCorrect: true },
      { text: "Peek", isCorrect: false }
    ]
  },
  {
    order: 30,
    marks: 1,
    text: "Which operation removes an element from a queue?",
    explanation: "The dequeue operation removes the front item from the queue.",
    options: [
      { text: "Push", isCorrect: false },
      { text: "Enqueue", isCorrect: false },
      { text: "Dequeue", isCorrect: true },
      { text: "Peek", isCorrect: false }
    ]
  },
  {
    order: 31,
    marks: 1,
    text: "In a standard queue, which element is removed first?",
    explanation: "In accordance with FIFO, the element that was inserted first is removed first.",
    options: [
      { text: "Most recently inserted", isCorrect: false },
      { text: "First inserted", isCorrect: true },
      { text: "Largest element", isCorrect: false },
      { text: "Middle element", isCorrect: false }
    ]
  },
  {
    order: 32,
    marks: 1,
    text: "Which two pointers are commonly used in a simple array-based queue?",
    explanation: "A queue typically maintains 'front' (removal end) and 'rear' (insertion end) pointer indices.",
    options: [
      { text: "Top and bottom", isCorrect: false },
      { text: "Low and mid", isCorrect: false },
      { text: "Front and rear", isCorrect: true },
      { text: "Left and right", isCorrect: false }
    ]
  },
  {
    order: 33,
    marks: 1,
    text: "Which real-life situation best represents a queue?",
    explanation: "People standing in a line at a ticket counter get served in arrival order (FIFO).",
    options: [
      { text: "Stack of plates", isCorrect: false },
      { text: "People waiting at a ticket counter", isCorrect: true },
      { text: "Undo operation", isCorrect: false },
      { text: "Function calls", isCorrect: false }
    ]
  },
  {
    order: 34,
    marks: 1,
    text: "What is queue underflow?",
    explanation: "Queue underflow occurs when attempting to dequeue an element from an empty queue.",
    options: [
      { text: "Inserting into a full queue", isCorrect: false },
      { text: "Removing from an empty queue", isCorrect: true },
      { text: "Sorting a queue", isCorrect: false },
      { text: "Viewing the front element", isCorrect: false }
    ]
  },
  {
    order: 35,
    marks: 1,
    text: "Which data structure is commonly used in Breadth-First Search (BFS)?",
    explanation: "Breadth-First Search (BFS) explores vertices level-by-level using a Queue.",
    options: [
      { text: "Stack", isCorrect: false },
      { text: "Queue", isCorrect: true },
      { text: "Binary Search", isCorrect: false },
      { text: "Selection Sort", isCorrect: false }
    ]
  },
  {
    order: 36,
    marks: 1,
    text: "Which data structure is commonly used to reverse a sequence using push and pop?",
    explanation: "Pushing elements onto a Stack and popping them retrieves them in reversed order.",
    options: [
      { text: "Queue", isCorrect: false },
      { text: "Stack", isCorrect: true },
      { text: "Linear Search", isCorrect: false },
      { text: "Array sorting only", isCorrect: false }
    ]
  },
  {
    order: 37,
    marks: 1,
    text: "What is the result of sorting [4, 2, 3] in ascending order?",
    explanation: "In ascending (non-decreasing) order, [4, 2, 3] becomes [2, 3, 4].",
    options: [
      { text: "[4, 3, 2]", isCorrect: false },
      { text: "[2, 3, 4]", isCorrect: true },
      { text: "[3, 2, 4]", isCorrect: false },
      { text: "[2, 4, 3]", isCorrect: false }
    ]
  },
  {
    order: 38,
    marks: 1,
    text: "Which search is usually more suitable for a small, unsorted array?",
    explanation: "Linear Search does not require prior sorting and has minimal overhead for small collections.",
    options: [
      { text: "Binary Search", isCorrect: false },
      { text: "Linear Search", isCorrect: true },
      { text: "Selection Sort", isCorrect: false },
      { text: "Bubble Sort", isCorrect: false }
    ]
  },
  {
    order: 39,
    marks: 1,
    text: "Which statement about a stack is correct?",
    explanation: "In a stack, both insertion (push) and deletion (pop) take place exclusively at the top.",
    options: [
      { text: "Insertion and deletion normally happen at the top", isCorrect: true },
      { text: "Insertion happens at the front and deletion at the rear", isCorrect: false },
      { text: "It always sorts elements", isCorrect: false },
      { text: "It follows FIFO", isCorrect: false }
    ]
  },
  {
    order: 40,
    marks: 1,
    text: "Which statement about a queue is correct?",
    explanation: "In a standard FIFO queue, insertion (enqueue) is done at the rear and deletion (dequeue) at the front.",
    options: [
      { text: "It follows LIFO", isCorrect: false },
      { text: "Insertion and deletion both occur only at the front", isCorrect: false },
      { text: "Insertion is at the rear and deletion is at the front", isCorrect: true },
      { text: "It always stores sorted elements", isCorrect: false }
    ]
  }
];

async function seedWeekendExam() {
  const baseUrl = 'http://localhost:4040';
  console.log(`Connecting to ${baseUrl}...`);

  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kavvyanfaculty@gmail.com', password: 'kavyan@faculty22' })
  });

  const { token } = await loginRes.json();
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const examPayload = {
    title: 'DSA_Weekend_Batch Exam',
    description: 'Data Structures Assessment for Weekend Batch: Arrays, Searching (Linear, Binary), Sorting (Bubble, Selection), Stacks (LIFO), and Queues (FIFO). Total 40 Multiple Choice Questions (40 Marks, 60 Mins).',
    startWindow: '2026-10-24T00:00:00',
    endWindow: '2026-12-31T23:59:59',
    durationMinutes: 60,
    totalMarks: 40,
    passMarks: 16,
    negativeMarkPerQuestion: 0,
    randomizeQuestions: false,
    randomizeOptions: false,
    maxViolationsAllowed: 3,
    enableWebcam: true,
    status: 'PUBLISHED'
  };

  // Check if exists
  const myExamsRes = await fetch(`${baseUrl}/api/v1/faculty/exams`, { headers: authHeaders });
  const myExams = await myExamsRes.json();
  const existingExam = myExams.find(e => e.title && e.title.includes('DSA_Weekend_Batch Exam'));

  let examId;
  if (existingExam) {
    console.log(`Found existing exam ID ${existingExam.id}. Recreating questions...`);
    examId = existingExam.id;
    await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(examPayload)
    });
    const fullExamRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, { headers: authHeaders });
    const fullExam = await fullExamRes.json();
    if (fullExam.questions && fullExam.questions.length > 0) {
      for (const q of fullExam.questions) {
        await fetch(`${baseUrl}/api/v1/faculty/exams/questions/${q.id}`, { method: 'DELETE', headers: authHeaders });
      }
    }
  } else {
    console.log('Creating new exam: DSA_Weekend_Batch Exam...');
    const createRes = await fetch(`${baseUrl}/api/v1/faculty/exams`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(examPayload)
    });
    const created = await createRes.json();
    examId = created.id;
    console.log(`Created exam with ID: ${examId}`);
  }

  console.log(`Uploading ${questions.length} questions...`);
  let count = 0;
  for (const q of questions) {
    const qPayload = {
      questionText: `Q${q.order}. ${q.text}`,
      explanation: q.explanation,
      marks: q.marks,
      questionOrder: q.order,
      options: q.options.map((opt, idx) => ({
        optionText: opt.text,
        isCorrect: opt.isCorrect,
        optionOrder: idx + 1
      }))
    };

    const addRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}/questions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(qPayload)
    });

    if (!addRes.ok) {
      console.error(`Error adding Q${q.order}:`, await addRes.text());
    } else {
      count++;
      process.stdout.write(`Added Q${q.order} (1M) [${count}/${questions.length}]\r`);
    }
  }

  const verifyRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, { headers: authHeaders });
  const finalExam = await verifyRes.json();
  console.log('\n--- VERIFICATION ---');
  console.log(`Exam ID: ${finalExam.id}`);
  console.log(`Title: ${finalExam.title}`);
  console.log(`Questions: ${finalExam.questionCount}`);
  console.log(`Total Marks: ${finalExam.totalMarks}`);
  console.log(`Pass Marks: ${finalExam.passMarks}`);
  console.log(`Status: ${finalExam.status}`);
}

seedWeekendExam().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
