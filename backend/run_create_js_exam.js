const { jsQuestions } = require('./seed_js_exam');

async function main() {
  const baseUrl = 'http://localhost:4040';
  console.log(`Connecting to ${baseUrl}...`);

  // 1. Faculty Login
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kavvyanfaculty@gmail.com', password: 'kavyan@faculty22' })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${await loginRes.text()}`);
  }

  const { token } = await loginRes.json();
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Check if exam already exists
  const myExamsRes = await fetch(`${baseUrl}/api/v1/faculty/exams`, { headers: authHeaders });
  const myExams = await myExamsRes.json();
  const existingExam = myExams.find(e => e.title === '2026CWD001(NEW)JS');

  let examId;
  const examPayload = {
    title: '2026CWD001(NEW)JS',
    description: 'JavaScript Fundamentals & Syntax Assessment — 2026CWD001(NEW)JS. Covers variables (let/const/var), console I/O, operators, conditions, switch statements, and program implementations.',
    startWindow: '2026-10-23T00:00:00',
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

  if (existingExam) {
    console.log(`Found existing exam ID ${existingExam.id}. Updating...`);
    examId = existingExam.id;
    await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(examPayload)
    });

    // Clear old questions if any
    const fullExamRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, { headers: authHeaders });
    const fullExam = await fullExamRes.json();
    if (fullExam.questions && fullExam.questions.length > 0) {
      console.log(`Clearing ${fullExam.questions.length} existing questions...`);
      for (const q of fullExam.questions) {
        await fetch(`${baseUrl}/api/v1/faculty/exams/questions/${q.id}`, {
          method: 'DELETE',
          headers: authHeaders
        });
      }
    }
  } else {
    console.log('Creating new exam: 2026CWD001(NEW)JS...');
    const createRes = await fetch(`${baseUrl}/api/v1/faculty/exams`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(examPayload)
    });
    if (!createRes.ok) {
      throw new Error(`Failed to create exam: ${await createRes.text()}`);
    }
    const created = await createRes.json();
    examId = created.id;
    console.log(`Created exam with ID: ${examId}`);
  }

  // 3. Upload all 22 questions
  console.log(`Uploading ${jsQuestions.length} questions into exam ID ${examId}...`);
  let count = 0;
  for (const q of jsQuestions) {
    const qPayload = {
      questionText: q.text,
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
      process.stdout.write(`Added Q${q.order} (${q.marks}M) [${count}/${jsQuestions.length}]\r`);
    }
  }

  console.log(`\nSuccessfully uploaded ${count} / ${jsQuestions.length} questions!`);

  // 4. Verify Final Exam
  const verifyRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, { headers: authHeaders });
  const finalExam = await verifyRes.json();
  console.log('\n--- VERIFICATION ---');
  console.log(`Exam ID: ${finalExam.id}`);
  console.log(`Title: ${finalExam.title}`);
  console.log(`Question Count: ${finalExam.questionCount}`);
  console.log(`Total Marks: ${finalExam.totalMarks}`);
  console.log(`Pass Marks: ${finalExam.passMarks}`);
  console.log(`Duration: ${finalExam.durationMinutes} mins`);
  console.log(`Status: ${finalExam.status}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
