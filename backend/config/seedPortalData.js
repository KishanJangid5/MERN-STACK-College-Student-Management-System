import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Syllabus from '../models/Syllabus.js';
import Fee from '../models/Fee.js';
import Examination from '../models/Examination.js';
import Result from '../models/Result.js';
import HallTicket from '../models/HallTicket.js';

dotenv.config();

const seedPortalData = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collegeDB';
    await mongoose.connect(connUri);
    console.log('[Seeder] Connected to MongoDB collegeDB');

    // Fetch existing students
    const students = await Student.find();
    if (students.length === 0) {
      console.log('[Seeder] No students found. Please ensure students are created.');
      process.exit(0);
    }
    console.log(`[Seeder] Found ${students.length} existing students to enrich with portal data.`);

    // 1. Ensure a demo student user account exists for testing student role
    const aarav = students.find((s) => s.email === 'aarav.sharma@college.edu') || students[0];
    const existingStudentUser = await User.findOne({ email: aarav.email });
    if (!existingStudentUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await User.create({
        name: aarav.name,
        email: aarav.email,
        password: hashedPassword,
        role: 'student',
        student: aarav._id
      });
      console.log(`[Seeder] Created demo student login: ${aarav.email} / password123`);
    } else if (existingStudentUser.role !== 'student' || !existingStudentUser.student) {
      existingStudentUser.role = 'student';
      existingStudentUser.student = aarav._id;
      await existingStudentUser.save();
      console.log(`[Seeder] Updated ${aarav.email} with student role & student ID reference.`);
    }

    // 2. Seed Syllabus for common courses if empty
    const syllabusCount = await Syllabus.countDocuments();
    if (syllabusCount === 0) {
      console.log('[Seeder] Seeding comprehensive academic syllabi...');
      const syllabiData = [
        {
          course: 'Computer Science',
          semester: 4,
          subjectCode: 'CS-401',
          subjectName: 'Design & Analysis of Algorithms',
          credits: 4,
          totalHours: 48,
          description: 'Comprehensive study of asymptotic complexity, divide and conquer, greedy methods, dynamic programming, graph traversal, and NP-completeness.',
          units: [
            {
              unitNumber: 1,
              title: 'Introduction to Algorithms & Complexity',
              hours: 10,
              topics: ['Asymptotic notations (Big-O, Omega, Theta)', 'Recurrence relations & Master Theorem', 'Divide and conquer paradigms', 'Strassen’s Matrix Multiplication']
            },
            {
              unitNumber: 2,
              title: 'Greedy Techniques & Graph Algorithms',
              hours: 10,
              topics: ['Fractional Knapsack Problem', 'Huffman Coding', 'Dijkstra’s Shortest Path Algorithm', 'Prim’s and Kruskal’s Minimum Spanning Tree']
            },
            {
              unitNumber: 3,
              title: 'Dynamic Programming & Memoization',
              hours: 12,
              topics: ['0/1 Knapsack Problem', 'Longest Common Subsequence (LCS)', 'Matrix Chain Multiplication', 'Bellman-Ford Algorithm & Floyd-Warshall']
            },
            {
              unitNumber: 4,
              title: 'Backtracking & Branch-and-Bound',
              hours: 8,
              topics: ['N-Queens Problem', 'Subset Sum Problem', 'Graph Coloring Problem', 'Traveling Salesperson Problem (TSP)']
            },
            {
              unitNumber: 5,
              title: 'NP-Completeness & Approximation',
              hours: 8,
              topics: ['P vs NP Complexity classes', 'Polynomial Time Reductions', 'NP-Complete & NP-Hard definitions', 'Approximation algorithms for Vertex Cover']
            }
          ],
          referenceBooks: [
            'Thomas H. Cormen, Charles E. Leiserson - Introduction to Algorithms (CLRS)',
            'Ellis Horowitz, Sartaj Sahni - Fundamentals of Computer Algorithms',
            'Jon Kleinberg, Éva Tardos - Algorithm Design'
          ]
        },
        {
          course: 'Computer Science',
          semester: 4,
          subjectCode: 'CS-402',
          subjectName: 'Database Management Systems',
          credits: 4,
          totalHours: 45,
          description: 'Relational data models, SQL queries, normalization, transaction processing, concurrency control, ACID properties, and indexing.',
          units: [
            {
              unitNumber: 1,
              title: 'Database Architecture & ER Modeling',
              hours: 9,
              topics: ['Three-schema architecture', 'Data independence', 'ER modeling concepts', 'Enhanced ER (EER) diagrams']
            },
            {
              unitNumber: 2,
              title: 'Relational Model & Advanced SQL',
              hours: 10,
              topics: ['Relational Algebra operators', 'Complex SQL joins & subqueries', 'Views, Triggers, and Stored Procedures', 'Integrity constraints']
            },
            {
              unitNumber: 3,
              title: 'Database Normalization',
              hours: 10,
              topics: ['Functional dependencies', '1NF, 2NF, 3NF, and BCNF normal forms', 'Lossless join decomposition', 'Dependency preservation']
            },
            {
              unitNumber: 4,
              title: 'Transaction Management & Concurrency',
              hours: 10,
              topics: ['ACID properties', 'Schedules & Serializability', 'Two-Phase Locking (2PL) protocol', 'Deadlock handling & recovery techniques']
            },
            {
              unitNumber: 5,
              title: 'Indexing & Storage Architecture',
              hours: 6,
              topics: ['B-Trees and B+ Trees indexing', 'Hash indexing', 'Query evaluation & optimization overview']
            }
          ],
          referenceBooks: [
            'Abraham Silberschatz, Henry Korth - Database System Concepts',
            'Raghu Ramakrishnan, Johannes Gehrke - Database Management Systems',
            'Ramez Elmasri, Shamkant Navathe - Fundamentals of Database Systems'
          ]
        },
        {
          course: 'Computer Science',
          semester: 4,
          subjectCode: 'CS-403',
          subjectName: 'Operating Systems & System Programming',
          credits: 4,
          totalHours: 45,
          description: 'Process management, CPU scheduling, threads, memory management, virtual memory, file systems, and Linux system calls.',
          units: [
            {
              unitNumber: 1,
              title: 'Process Management & CPU Scheduling',
              hours: 10,
              topics: ['Process control block (PCB)', 'Context switching', 'FCFS, SJF, Round Robin, Multi-level queue scheduling', 'Inter-process communication (IPC)']
            },
            {
              unitNumber: 2,
              title: 'Process Synchronization & Deadlocks',
              hours: 10,
              topics: ['Critical section problem', 'Peterson’s solution, Semaphores, and Mutex', 'Classical IPC problems (Dining Philosophers, Producer-Consumer)', 'Banker’s algorithm for deadlock avoidance']
            },
            {
              unitNumber: 3,
              title: 'Memory Management & Paging',
              hours: 10,
              topics: ['Contiguous allocation & fragmentation', 'Paging architecture & Page tables', 'Translation Lookaside Buffer (TLB)', 'Segmentation']
            },
            {
              unitNumber: 4,
              title: 'Virtual Memory & Page Replacement',
              hours: 8,
              topics: ['Demand paging', 'Page fault handling', 'FIFO, LRU, Optimal page replacement algorithms', 'Thrashing & Working set model']
            },
            {
              unitNumber: 5,
              title: 'Storage & File System Implementation',
              hours: 7,
              topics: ['File allocation methods', 'Disk scheduling algorithms (SSTF, SCAN, C-LOOK)', 'Access control and directory structure']
            }
          ],
          referenceBooks: [
            'Silberschatz, Galvin, Gagne - Operating System Concepts',
            'Andrew S. Tanenbaum - Modern Operating Systems',
            'William Stallings - Operating Systems: Internals and Design Principles'
          ]
        },
        {
          course: 'Information Technology',
          semester: 5,
          subjectCode: 'IT-501',
          subjectName: 'Web Engineering & Cloud Architecture',
          credits: 4,
          totalHours: 45,
          description: 'Modern full-stack web applications, REST/GraphQL APIs, microservices, containerization, and cloud deployment.',
          units: [
            {
              unitNumber: 1,
              title: 'Modern Web Architecture & Protocols',
              hours: 9,
              topics: ['HTTP/2 and HTTP/3 specifications', 'Client-Server architecture', 'Single Page Applications (SPAs)', 'State management patterns']
            },
            {
              unitNumber: 2,
              title: 'Backend Services & RESTful Design',
              hours: 10,
              topics: ['REST architectural constraints', 'JWT authentication and OAuth 2.0', 'API rate limiting and security', 'Middleware design']
            },
            {
              unitNumber: 3,
              title: 'Cloud Computing & Serverless',
              hours: 10,
              topics: ['IaaS, PaaS, SaaS paradigms', 'AWS EC2, S3, and Lambda architecture', 'Serverless computing benefits and limitations']
            },
            {
              unitNumber: 4,
              title: 'Containerization & Orchestration',
              hours: 9,
              topics: ['Docker containers & Dockerfile best practices', 'Multi-stage builds', 'Kubernetes architecture overview', 'CI/CD pipelines']
            },
            {
              unitNumber: 5,
              title: 'Performance & Scalability',
              hours: 7,
              topics: ['CDN caching strategies', 'Database read replicas and sharding', 'Load balancing algorithms', 'Web security (OWASP Top 10)']
            }
          ],
          referenceBooks: [
            'Gerti Kappel - Web Engineering: The Discipline of Systematic Development',
            'Martin Kleppmann - Designing Data-Intensive Applications'
          ]
        },
        {
          course: 'Information Technology',
          semester: 7,
          subjectCode: 'IT-701',
          subjectName: 'Information & Network Security',
          credits: 4,
          totalHours: 45,
          description: 'Cryptography, public key infrastructure, network vulnerabilities, firewalls, and cyber defense strategies.',
          units: [
            {
              unitNumber: 1,
              title: 'Cryptographic Foundations',
              hours: 10,
              topics: ['Symmetric encryption (AES, DES)', 'Asymmetric cryptography (RSA, ECC)', 'Cryptographic hash functions (SHA-256)', 'Digital signatures']
            },
            {
              unitNumber: 2,
              title: 'Network Protocols & Authentication',
              hours: 10,
              topics: ['TLS/SSL handshake protocol', 'IPSec & VPN architecture', 'Kerberos authentication protocol', 'Public Key Infrastructure (PKI)']
            },
            {
              unitNumber: 3,
              title: 'Network Vulnerabilities & Firewalls',
              hours: 10,
              topics: ['DDoS attacks and mitigation', 'Packet filtering & Stateful inspection firewalls', 'Intrusion Detection & Prevention Systems (IDS/IPS)']
            },
            {
              unitNumber: 4,
              title: 'Web Application Security',
              hours: 8,
              topics: ['SQL Injection & prevention', 'Cross-Site Scripting (XSS)', 'Cross-Site Request Forgery (CSRF)', 'Security headers']
            },
            {
              unitNumber: 5,
              title: 'Cybersecurity Regulations & Compliance',
              hours: 7,
              topics: ['ISO 27001 standard', 'GDPR data privacy principles', 'Incident response handling', 'Ethical hacking methodologies']
            }
          ],
          referenceBooks: [
            'William Stallings - Cryptography and Network Security',
            'Behrouz A. Forouzan - Cryptography & Network Security'
          ]
        },
        {
          course: 'Data Science',
          semester: 2,
          subjectCode: 'DS-201',
          subjectName: 'Applied Statistics & Probability for Data Science',
          credits: 4,
          totalHours: 45,
          description: 'Descriptive statistics, probability distributions, hypothesis testing, ANOVA, linear regression, and statistical inference.',
          units: [
            {
              unitNumber: 1,
              title: 'Probability Theory & Random Variables',
              hours: 9,
              topics: ['Sample space, events, conditional probability', 'Bayes Theorem', 'Discrete & Continuous random variables', 'Expectation and Variance']
            },
            {
              unitNumber: 2,
              title: 'Probability Distributions',
              hours: 10,
              topics: ['Binomial and Poisson distributions', 'Normal distribution & Central Limit Theorem', 'Student’s t-distribution', 'Chi-Square distribution']
            },
            {
              unitNumber: 3,
              title: 'Hypothesis Testing & Confidence Intervals',
              hours: 10,
              topics: ['Null and alternative hypotheses', 'Type I and Type II errors', 'Z-tests and t-tests (one-sample, two-sample)', 'p-value interpretation']
            },
            {
              unitNumber: 4,
              title: 'Analysis of Variance (ANOVA) & Chi-Square',
              hours: 9,
              topics: ['One-way and Two-way ANOVA', 'F-distribution and F-tests', 'Chi-Square test of independence', 'Goodness-of-fit testing']
            },
            {
              unitNumber: 5,
              title: 'Regression Analysis & Correlation',
              hours: 7,
              topics: ['Pearson and Spearman correlation coefficients', 'Simple linear regression model', 'Ordinary Least Squares (OLS)', 'Residual diagnostics']
            }
          ],
          referenceBooks: [
            'Sheldon M. Ross - Introduction to Probability and Statistics for Engineers and Scientists',
            'Douglas C. Montgomery - Applied Statistics and Probability for Engineers'
          ]
        },
        {
          course: 'Artificial Intelligence',
          semester: 6,
          subjectCode: 'AI-601',
          subjectName: 'Deep Learning & Neural Architectures',
          credits: 4,
          totalHours: 45,
          description: 'Feedforward neural networks, backpropagation, CNNs for computer vision, RNNs/Transformers for NLP, and generative models.',
          units: [
            {
              unitNumber: 1,
              title: 'Neural Networks & Optimization',
              hours: 9,
              topics: ['Perceptrons and Multi-layer Perceptrons', 'Activation functions (ReLU, Sigmoid, GeLU)', 'Backpropagation mathematical derivation', 'Adam and RMSprop optimizers']
            },
            {
              unitNumber: 2,
              title: 'Convolutional Neural Networks (CNNs)',
              hours: 10,
              topics: ['Convolution operations & pooling layers', 'ResNet, VGG, and EfficientNet architectures', 'Data augmentation techniques', 'Transfer learning strategies']
            },
            {
              unitNumber: 3,
              title: 'Sequence Modeling & Attention Mechanisms',
              hours: 10,
              topics: ['Recurrent Neural Networks (RNNs) & vanishing gradients', 'LSTM and GRU gating mechanisms', 'Self-Attention mechanism', 'Transformer encoder-decoder architecture']
            },
            {
              unitNumber: 4,
              title: 'Generative AI & LLM Foundations',
              hours: 9,
              topics: ['Generative Adversarial Networks (GANs)', 'Variational Autoencoders (VAEs)', 'Diffusion models intuition', 'Pre-training and fine-tuning Large Language Models']
            },
            {
              unitNumber: 5,
              title: 'Model Deployment & Explainable AI',
              hours: 7,
              topics: ['Model quantization (INT8/FP16)', 'ONNX runtime deployment', 'SHAP and LIME interpretability', 'AI ethics and bias mitigation']
            }
          ],
          referenceBooks: [
            'Ian Goodfellow, Yoshua Bengio, Aaron Courville - Deep Learning',
            'Aurélien Géron - Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow'
          ]
        }
      ];

      await Syllabus.insertMany(syllabiData);
      console.log(`[Seeder] Created ${syllabiData.length} syllabus modules.`);
    }

    // 3. Seed Examinations if empty
    const examCount = await Examination.countDocuments();
    if (examCount === 0) {
      console.log('[Seeder] Seeding examination schedules...');
      const examsData = [
        {
          examName: 'Mid-Term Examinations Spring 2026',
          course: 'Computer Science',
          semester: 4,
          subjectCode: 'CS-401',
          subjectName: 'Design & Analysis of Algorithms',
          examDate: new Date('2026-11-10T10:00:00Z'),
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          duration: '3 Hours',
          venue: 'Hall 302, Academic Block A',
          examType: 'Theory',
          maxMarks: 100,
          status: 'Scheduled'
        },
        {
          examName: 'Mid-Term Examinations Spring 2026',
          course: 'Computer Science',
          semester: 4,
          subjectCode: 'CS-402',
          subjectName: 'Database Management Systems',
          examDate: new Date('2026-11-13T10:00:00Z'),
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          duration: '3 Hours',
          venue: 'Hall 302, Academic Block A',
          examType: 'Theory',
          maxMarks: 100,
          status: 'Scheduled'
        },
        {
          examName: 'Mid-Term Examinations Spring 2026',
          course: 'Computer Science',
          semester: 4,
          subjectCode: 'CS-403',
          subjectName: 'Operating Systems & System Programming',
          examDate: new Date('2026-11-17T10:00:00Z'),
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          duration: '3 Hours',
          venue: 'Hall 205, Academic Block B',
          examType: 'Theory',
          maxMarks: 100,
          status: 'Scheduled'
        },
        {
          examName: 'End-Semester Final Examinations 2026',
          course: 'Information Technology',
          semester: 7,
          subjectCode: 'IT-701',
          subjectName: 'Information & Network Security',
          examDate: new Date('2026-11-12T02:00:00Z'),
          startTime: '02:00 PM',
          endTime: '05:00 PM',
          duration: '3 Hours',
          venue: 'Auditorium Hall C, West Campus',
          examType: 'Theory',
          maxMarks: 100,
          status: 'Scheduled'
        },
        {
          examName: 'Semester Assessment Examination 2026',
          course: 'Data Science',
          semester: 2,
          subjectCode: 'DS-201',
          subjectName: 'Applied Statistics & Probability for Data Science',
          examDate: new Date('2026-11-15T10:00:00Z'),
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          duration: '3 Hours',
          venue: 'Computing Lab 4, IT Block',
          examType: 'Theory',
          maxMarks: 100,
          status: 'Scheduled'
        },
        {
          examName: 'Advanced Project Review 2026',
          course: 'Artificial Intelligence',
          semester: 6,
          subjectCode: 'AI-601',
          subjectName: 'Deep Learning & Neural Architectures',
          examDate: new Date('2026-11-18T09:30:00Z'),
          startTime: '09:30 AM',
          endTime: '12:30 PM',
          duration: '3 Hours',
          venue: 'AI Research Center, Level 2',
          examType: 'Practical',
          maxMarks: 100,
          status: 'Scheduled'
        }
      ];
      await Examination.insertMany(examsData);
      console.log(`[Seeder] Created ${examsData.length} examination schedules.`);
    }

    // 4. Enrich each student with Attendance, Fees, Results, and Hall Tickets
    for (const student of students) {
      // A. Attendance records
      const attCount = await Attendance.countDocuments({ student: student._id });
      if (attCount === 0) {
        const subjects = [
          { name: 'Data Structures & Algorithms', code: 'CS-401' },
          { name: 'Database Management Systems', code: 'CS-402' },
          { name: 'Operating Systems', code: 'CS-403' },
          { name: 'Computer Networks', code: 'CS-404' },
          { name: 'Software Engineering', code: 'CS-405' }
        ];

        const attEntries = [];
        const today = new Date();

        // Generate 24 sessions over past 40 days
        for (let i = 40; i >= 1; i -= 2) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const subj = subjects[i % subjects.length];
          // 85% chance present, 10% absent, 5% late
          const rand = Math.random();
          const status = rand > 0.15 ? 'Present' : rand > 0.05 ? 'Absent' : 'Late';

          attEntries.push({
            student: student._id,
            subject: subj.name,
            subjectCode: subj.code,
            date,
            status,
            sessionType: i % 3 === 0 ? 'Practical / Lab' : 'Lecture',
            semester: student.semester || 4,
            remarks: status === 'Absent' ? 'Unexcused medical / personal absence' : status === 'Late' ? 'Arrived 10 mins late' : 'Attended'
          });
        }
        await Attendance.insertMany(attEntries);
        console.log(`[Seeder] Seeded ${attEntries.length} attendance entries for ${student.name}`);
      }

      // B. Fee records
      const feeCount = await Fee.countDocuments({ student: student._id });
      if (feeCount === 0) {
        const fee1 = new Fee({
          student: student._id,
          academicYear: '2025-2026',
          semester: student.semester || 4,
          feeType: 'Consolidated Semester Fee',
          totalAmount: 65000,
          amountPaid: 45000,
          dueDate: new Date('2026-12-15'),
          paymentHistory: [
            {
              receiptNo: `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
              amount: 25000,
              paymentDate: new Date('2026-08-10'),
              paymentMethod: 'UPI',
              transactionId: `TXN${Date.now() - 50000000}`,
              notes: 'Term 1 Installment via Net Banking'
            },
            {
              receiptNo: `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
              amount: 20000,
              paymentDate: new Date('2026-09-15'),
              paymentMethod: 'Card',
              transactionId: `TXN${Date.now() - 20000000}`,
              notes: 'Term 2 Installment via Debit Card'
            }
          ]
        });
        await fee1.save();

        const fee2 = new Fee({
          student: student._id,
          academicYear: '2025-2026',
          semester: student.semester || 4,
          feeType: 'Examination Fee',
          totalAmount: 3500,
          amountPaid: 3500,
          dueDate: new Date('2026-10-30'),
          paymentHistory: [
            {
              receiptNo: `REC-EXAM-${Math.floor(100000 + Math.random() * 900000)}`,
              amount: 3500,
              paymentDate: new Date('2026-10-12'),
              paymentMethod: 'UPI',
              transactionId: `TXN${Date.now() - 10000000}`,
              notes: 'Semester Examination Fee Full Clearance'
            }
          ]
        });
        await fee2.save();
        console.log(`[Seeder] Seeded fee invoices for ${student.name}`);
      }

      // C. Examination Results
      const resCount = await Result.countDocuments({ student: student._id });
      if (resCount === 0) {
        // Previous semester result (e.g. Semester 3)
        const prevSem = Math.max(1, (student.semester || 4) - 1);
        const result1 = new Result({
          student: student._id,
          examName: `Semester ${prevSem} End-Term Examination`,
          academicYear: '2024-2025',
          semester: prevSem,
          subjects: [
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-301`,
              subjectName: 'Object Oriented Programming with Java',
              credits: 4,
              internalMarks: 27,
              externalMarks: 62,
              marksObtained: 89,
              maxMarks: 100,
              grade: 'A+',
              gradePoint: 9,
              status: 'Pass'
            },
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-302`,
              subjectName: 'Discrete Mathematical Structures',
              credits: 4,
              internalMarks: 25,
              externalMarks: 58,
              marksObtained: 83,
              maxMarks: 100,
              grade: 'A',
              gradePoint: 8,
              status: 'Pass'
            },
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-303`,
              subjectName: 'Computer Organization & Architecture',
              credits: 4,
              internalMarks: 28,
              externalMarks: 64,
              marksObtained: 92,
              maxMarks: 100,
              grade: 'O',
              gradePoint: 10,
              status: 'Pass'
            },
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-304`,
              subjectName: 'Digital Logic & Microprocessors',
              credits: 4,
              internalMarks: 24,
              externalMarks: 52,
              marksObtained: 76,
              maxMarks: 100,
              grade: 'A',
              gradePoint: 8,
              status: 'Pass'
            },
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-305`,
              subjectName: 'Advanced Programming Lab',
              credits: 2,
              internalMarks: 48,
              externalMarks: 46,
              marksObtained: 94,
              maxMarks: 100,
              grade: 'O',
              gradePoint: 10,
              status: 'Pass'
            }
          ],
          publicationStatus: 'Published',
          publishedAt: new Date('2025-06-20'),
          remarks: 'First Class with Distinction'
        });
        await result1.save();
        console.log(`[Seeder] Seeded published semester result for ${student.name}`);
      }

      // D. Hall Ticket
      const htCount = await HallTicket.countDocuments({ student: student._id });
      if (htCount === 0) {
        const cleanRoll = student.rollNumber.replace(/\s+/g, '-');
        const ht = new HallTicket({
          student: student._id,
          examName: `Spring 2026 Semester ${student.semester || 4} Examinations`,
          academicYear: '2025-2026',
          semester: student.semester || 4,
          hallTicketNumber: `HT-2026-${cleanRoll}`,
          issueDate: new Date(),
          institutionName: 'College of Engineering & Technology',
          centerCode: 'CET-MAIN-04',
          papers: [
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-401`,
              subjectName: 'Design & Analysis of Algorithms',
              examDate: new Date('2026-11-10T10:00:00Z'),
              time: '10:00 AM - 01:00 PM',
              venue: 'Hall 302, Academic Block A'
            },
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-402`,
              subjectName: 'Database Management Systems',
              examDate: new Date('2026-11-13T10:00:00Z'),
              time: '10:00 AM - 01:00 PM',
              venue: 'Hall 302, Academic Block A'
            },
            {
              subjectCode: `${student.course.substring(0, 2).toUpperCase()}-403`,
              subjectName: 'Operating Systems & System Programming',
              examDate: new Date('2026-11-17T10:00:00Z'),
              time: '10:00 AM - 01:00 PM',
              venue: 'Hall 205, Academic Block B'
            }
          ],
          publicationStatus: 'Published'
        });
        await ht.save();
        console.log(`[Seeder] Seeded published hall ticket for ${student.name}`);
      }
    }

    console.log('[Seeder] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedPortalData();
