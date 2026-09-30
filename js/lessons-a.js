window.LESSONS = window.LESSONS || [];

window.LESSONS.push({
  id: 1,
  section: "Algorithms and dynamic programming",
  nav: "Non-adjacent sum",
  title: "The richest walk that skips every neighbor",
  promise: "You will see why the best sum of non-adjacent houses needs only two remembered numbers, and why the other three formulas rob the wrong houses.",
  question: "Which recurrence finds max non-adjacent sum in O(1) space?",
  correct: 0,
  options: [
    { k: "A", t: "dp = max(prev1, prev2 + val)", why: "prev1 is the best sum if we skip this house. prev2 + val is the best sum if we take it. The answer is the larger of those two, and those two numbers are all the history we need." },
    { k: "B", t: "dp = prev1 + max(0, val)", why: "This adds the current house onto the previous best. The previous best may already include the neighbor, so the houses touch. Positive values get taken almost every time." },
    { k: "C", t: "dp = prev2 + val", why: "This always takes the current house. It never considers the choice 'skip it and keep prev1', so a large neighbor is thrown away." },
    { k: "D", t: "dp = min(prev1, prev2) + val", why: "Two mistakes at once: min looks for the worse past, and adding val still forces us to take the house. We want the best past, and we want a choice." },
  ],
  frames: [
    { h: "A street with one rule", say: "Each house holds cash. You may rob a house, but then you must leave its neighbor alone. The goal is the most cash, not the most houses." },
    { h: "Two sticky notes, not a whole table", say: "Call prev1 the best sum using houses up to the previous one. Call prev2 the best sum stopping one house earlier. Before we start, both are 0. We never store a row of answers." },
    { h: "House 1 holds 4", say: "Skipping pays prev1, which is 0. Taking pays prev2 + 4, which is 4. We keep 4, and we take the house. Then the notes slide forward: the old prev1 becomes prev2, and 4 becomes prev1." },
    { h: "House 2 holds 1", say: "Skipping keeps 4. Taking pays 0 + 1 = 1. Four is larger, so we skip this house. The neighbor rule is doing its job: 4 and 1 sit side by side, and we refuse the pair." },
    { h: "House 3 holds 5", say: "Skipping keeps 4. Taking pays prev2 + 5. prev2 is the best from two houses back, which is 4, so taking pays 9. We take it. The chosen houses are the first and the third. They do not touch." },
    { h: "House 4 holds 3", say: "Skipping keeps 9. Taking pays 4 + 3 = 7. Nine wins, so we leave the last house. The whole street is finished and the only numbers we still hold are enough." },
    { h: "The answer is the newer note", say: "prev1 is 9. That is the maximum non-adjacent sum. A full table would have stored four answers. We reused two variables, so the extra memory is O(1): it does not grow with the street." },
    { h: "What the other lines do to this street", say: "B adds every positive house and scores 13, which robs neighbors. C insists on taking and loses the choice that saved 9. D takes the worse memory and still adds the house. Only the max of 'skip' and 'take' is the rule." },
  ],
  paint(d, frame) {
    const vals = [4, 1, 5, 3];
    const steps = [
      { prev2: 0, prev1: 0, take: 4, skip: 0, cur: 4, took: true },
      { prev2: 0, prev1: 4, take: 1, skip: 4, cur: 4, took: false },
      { prev2: 4, prev1: 4, take: 9, skip: 4, cur: 9, took: true },
      { prev2: 4, prev1: 9, take: 7, skip: 9, cur: 9, took: false },
    ];
    const focus = frame >= 2 && frame <= 5 ? frame - 2 : -1;
    vals.forEach((val, i) => {
      let tone = "idle";
      if (frame >= 6 && frame !== 7) tone = (i === 0 || i === 2) ? "good" : "mute";
      else if (frame === 7) tone = "mute";
      else if (focus === i) tone = "hot";
      else if (focus > i) tone = steps[i].took ? "good" : "mute";
      const x = 40 + i * 210;
      d.rect(x, 28, 190, 92, { tone, rx: 10 });
      d.text(x + 95, 52, "House " + (i + 1), { anchor: "middle", size: 13, fill: "#787774" });
      d.text(x + 95, 86, String(val), { anchor: "middle", size: 28, mono: true, weight: 600 });
    });
    if (frame === 0) {
      d.text(40, 220, "Take a house, and the houses on either side stay shut.", { size: 18, fill: "#787774" });
      return;
    }
    if (frame === 7) {
      d.card(40, 160, 250, 200, "B  adds the neighbor", ["prev1 + value", "4+1+5+3 = 13", "houses touch"], "bad");
      d.card(315, 160, 250, 200, "C  always takes", ["prev2 + value only", "never keeps a skip", "loses the 9"], "warn");
      d.card(590, 160, 250, 200, "A  chooses", ["max(skip, take)", "skip 9 or take 7", "keep 9"], "good");
      return;
    }
    const step = focus >= 0 ? steps[focus] : { prev2: 0, prev1: 0 };
    d.card(40, 160, 250, 130, "prev2   two houses back", [String(step.prev2)], "idle");
    d.card(315, 160, 250, 130, "prev1   one house back", [String(step.prev1)], "hot");
    if (focus >= 0) {
      d.card(590, 160, 250, 210, "Decision", [
        "skip = " + step.skip,
        "take = " + step.prev2 + "+" + vals[focus] + " = " + step.take,
        "dp = " + step.cur,
        step.took ? "take this house" : "skip this house",
      ], step.took ? "good" : "warn");
    } else if (frame >= 6) {
      d.card(590, 160, 250, 150, "Memory still O(1)", ["prev1 = 9", "no array stored"], "good");
    } else {
      d.card(590, 160, 250, 130, "Not started", ["both notes are 0"], "mute");
    }
    d.text(40, 470, "dp = max(prev1, prev2 + val)     then slide the notes forward", { mono: true, size: 16, fill: "#1f6c9f" });
  },
  notes: [
    { h: "Say it without the letters", p: [
      "Walk the street from left to right. At each house you have exactly two legal plans. Plan skip: do not touch this house, so the best you can do is whatever was already best at the previous house. Plan take: pocket this house, but then the previous house is forbidden, so you may only attach this cash to the best plan from two houses ago.",
      "You do not need the plan from three houses ago as its own variable. That older plan is already folded into prev1 or prev2. The past collapses.",
    ] },
    { h: "Why the space is O(1)", p: [
      "The textbook table is `dp[i] = max(dp[i-1], dp[i-2] + value[i])`. Look at the right-hand side. It mentions only the two previous answers. Once they have been used, every earlier cell is dead.",
      "So replace the array with two variables. After computing the new answer, the old prev1 becomes prev2, and the new answer becomes prev1. Two numbers, however long the street. That is O(1) extra space. The input itself is still there; 'O(1) space' means the extra memory.",
    ], code: "cur  = max(prev1, prev2 + val)\nprev2 = prev1\nprev1 = cur" },
    { h: "Work the same street by hand", p: [
      "Values 4, 1, 5, 3. Start prev2 = 0, prev1 = 0. House 4: max(0, 0+4) = 4. Notes become prev2 = 0, prev1 = 4. House 1: max(4, 0+1) = 4. Notes become 4 and 4. House 5: max(4, 4+5) = 9. Notes become 4 and 9. House 3: max(9, 4+3) = 9.",
      "Check the claim another way. The legal subsets are {4}, {1}, {5}, {3}, {4,5}, {4,3}, {1,3}. The sums are 4, 1, 5, 3, 9, 7, 4. The best is 9. The two notes found it.",
    ] },
    { h: "How to spot this question later", p: [
      "Any 'best choice, but not two in a row' problem is this one: house robber, stickers along a fence, a row of tasks with cooldown 1. If the row is a circle, the first and last also touch, so you solve two straight streets and take the better. That is the advanced version; the formula on each street does not change.",
      "O(1) space is the clue that they want the two-variable form, not merely the recurrence written as `dp[i]`. All four options are written with prev1 and prev2. The test is whether the combination is a max of a skip and a take.",
    ] },
  ],
});

window.LESSONS.push({
  id: 2,
  section: "Graphs and trees",
  nav: "Kosaraju's second pass",
  title: "Two walks that find the loops",
  promise: "You will watch a directed graph split into groups where everyone can reach everyone else, and you will see why the second walk must be on the reversed arrows, in reverse finishing order.",
  question: "In Kosaraju SCC algorithm, what is the 2nd DFS run on?",
  correct: 0,
  options: [
    { k: "A", t: "Transposed graph in reverse finish order", why: "The first search records when each node finishes. The second search walks the reversed arrows, starting from the nodes that finished latest. Each tree it grows is one strongly connected component." },
    { k: "B", t: "Original graph in ascending start order", why: "The original arrows were already used in the first search. Starting times, in increasing order, do not give the components. Kosaraju needs finishing times, read backwards, on the transpose." },
    { k: "C", t: "Complement graph in BFS order", why: "The complement is a different graph: it contains exactly the edges the original lacks. Breadth-first search is the wrong traversal. Kosaraju is two depth-first searches." },
    { k: "D", t: "Minimum spanning tree", why: "A minimum spanning tree is an undirected, weighted idea (Kruskal or Prim). Strong components are about directed reachability. No weights are involved." },
  ],
  frames: [
    { h: "Who can reach whom", say: "An arrow is one-way. A strongly connected component is a group where every node can reach every other node by following arrows. Here A, B, and C sit in a loop. D can be reached from B, but D cannot get back." },
    { h: "First search: write down who finishes", say: "Start at A, go to B, go to C. C's only arrow returns to A, which we are already inside, so C has nothing new and finishes first. Then D is a dead end and finishes. Then B finishes. Then A finishes." },
    { h: "Read that list backwards", say: "Finish order was C, then D, then B, then A. Reverse finish order is A, B, D, C. The second search will try roots in that order, skipping anyone already claimed." },
    { h: "Turn every arrow around", say: "The transpose is the same nodes with every arrow reversed. A→B becomes B→A, B→C becomes C→B, C→A becomes A→C, and B→D becomes D→B. We do not invent new connections. We only flip the ones we had." },
    { h: "Second search from A", say: "On the reversed graph, start at A because A finished last. A reaches C, and C reaches B. Those three come home together. D does not appear, because the only reversed arrow at D points into B, and we are walking out of the component, not into D." },
    { h: "Then D, the next unused root", say: "B and C are already visited, so the next root in reverse finish order is D. D's search finds only D. Two components: {A, B, C} and {D}. The second search did not use the original arrows, a complement, or a spanning tree." },
    { h: "Why the order is not optional", say: "Reverse finish order starts in a 'source' component of the reversed graph, which is a 'sink' of the original. You finish a component before leaking into the next one. Ascending start times do not have that guarantee." },
  ],
  paint(d, frame) {
    const base = [
      { id: "A", label: "A", x: 180, y: 150 },
      { id: "B", label: "B", x: 420, y: 150 },
      { id: "C", label: "C", x: 300, y: 320 },
      { id: "D", label: "D", x: 680, y: 230 },
    ];
    const subs = {
      1: { C: "done 1", D: "done 2", B: "done 3", A: "done 4" },
      2: { A: "start 1", B: "start 2", D: "start 3", C: "start 4" },
    };
    const tone = {};
    if (frame === 1) Object.assign(tone, { A: "hot", B: "hot", C: "good", D: "warn" });
    if (frame === 4 || frame === 5) Object.assign(tone, { A: "good", B: "good", C: "good", D: frame === 5 ? "warn" : "mute" });
    const nodes = base.map((n) => ({ ...n, tone: tone[n.id] || "idle", sub: (subs[frame] || {})[n.id] }));
    const original = [
      { a: "A", b: "B" },
      { a: "B", b: "C", bend: 30 },
      { a: "C", b: "A", bend: 30 },
      { a: "B", b: "D" },
    ];
    const flipped = [
      { a: "B", b: "A" },
      { a: "C", b: "B", bend: 30 },
      { a: "A", b: "C", bend: 30 },
      { a: "D", b: "B" },
    ];
    const edges = (frame >= 3 ? flipped : original).map((e) => ({
      ...e,
      tone: frame >= 4 && e.a !== "D" && e.b !== "D" ? "good" : "idle",
    }));
    d.graph(nodes, edges);
    const caption = [
      "Original arrows. The triangle is one loop. D is a dead end.",
      "First DFS. Finish order: C, D, B, A.",
      "Reverse finish order: A, then B, then D, then C.",
      "Transpose: every arrow has been turned around.",
      "Second DFS from A gathers {A, C, B}.",
      "Next unused root is D. Its component is {D}.",
      "Second DFS = transpose + reverse finishing times.",
    ][frame];
    d.text(40, 470, caption, { size: 16, fill: "#1f6c9f" });
  },
  notes: [
    { h: "The word the exam is using", p: [
      "SCC means strongly connected component. 'Strongly' means the arrows have to work in both directions, possibly along different paths. If you ignore direction, the graph above is one piece. With direction, it is two components, because nobody can leave D and come back, and D cannot reach A.",
      "Transpose means reverse every edge. It is not the complement. The complement would add every missing edge and delete every existing one. Kosaraju does not do that.",
    ] },
    { h: "What the first search is for", p: [
      "Run an ordinary depth-first search on the original graph. The number we keep is the finishing time: the moment a node's exploration is over, after all of its outgoing arrows have been tried. In the picture, C finishes first because its arrow only leads back into the current path. A finishes last because it was the root.",
      "If the graph has several separate pieces, restart the first search on any unvisited node until everyone has finished. Push nodes onto a stack as they finish. Reading the stack from the top is reverse finish order.",
    ] },
    { h: "What the second search is for", p: [
      "Flip every arrow. Then depth-first search again, but the roots must be taken in reverse finish order. The first tree you grow is one component. Erase those nodes, in your mind, and start at the next unfinished node in that order. Each tree is one component.",
      "Why it works, in one picture: inside a component you can go anywhere, so the second search fills the component. Between components, reverse finish order makes you start on the side that, after flipping, has no arrow leaving toward an earlier component. You cannot leak.",
    ] },
    { h: "The cousins, so the traps have names", p: [
      "Tarjan's algorithm and the path-based method find the same components in one depth-first search, using a stack and low-link values. Kosaraju's price is two searches, and its gift is that each step is an ordinary DFS. Interviewers ask it because the second search has a very specific setting.",
      "A minimum spanning tree needs undirected weights. BFS finds shortest paths in unweighted graphs. Start times are when you first enter a node; Kosaraju never sorts by those. If a choice says complement, original graph, BFS, or spanning tree, it is describing a different chapter.",
    ] },
  ],
});

window.LESSONS.push({
  id: 3,
  section: "Concurrency and the machine",
  nav: "Double-checked locking",
  title: "A shortcut that publishes a half-built object",
  promise: "You will see two threads, one lock, and the quiet reorder that makes double-checked locking unsafe unless the published reference is volatile.",
  question: "Why does double-checked locking fail without volatile?",
  correct: 0,
  options: [
    { k: "A", t: "Instruction reordering exposes half-init object", why: "The creating thread can make the reference visible before the constructor's writes. Another thread then passes the unlocked check, sees a non-null reference, and uses fields that are still at their default values." },
    { k: "B", t: "Thread deadlock on outer check", why: "The outer check takes no lock. There is nothing to deadlock on. The bug is a stale or reordered view of memory, not two threads stuck waiting." },
    { k: "C", t: "Cache invalidation throws SIGSEGV", why: "A stale cache line returns old data. It does not raise SIGSEGV. SIGSEGV is an invalid memory access, a different failure." },
    { k: "D", t: "Monitor lock timeout after 100ms", why: "A Java monitor does not time out after 100 milliseconds. synchronized waits until it can enter. The bug appears even when the lock behaves perfectly." },
  ],
  frames: [
    { h: "The shortcut people wanted", say: "Building the one shared object is slow, and taking a lock is not free. So the code checks 'does it exist?' with no lock. Only the first thread, the one that sees null, goes inside the lock and builds it. Everyone later should skip the lock." },
    { h: "Inside the lock, construction has steps", say: "new is not one invisible moment. The machine allocates a blank object, writes the fields, and only then has a finished thing. Thread 1 is inside the lock, doing those writes. Thread 2 has not looked yet." },
    { h: "The pointer can escape early", say: "Without volatile, the compiler and the CPU may publish the reference before the field writes are visible to other cores. Memory now says 'the object exists' while price and name are still the blank defaults." },
    { h: "Thread 2 never takes the lock", say: "Thread 2 does the outer check, sees a non-null reference, and skips the synchronized block. The lock cannot protect it, because this thread never enters the lock. It reads a half-initialized object. That is the bug." },
    { h: "volatile is an ordering promise", say: "Marking the reference volatile inserts a memory barrier. Everything the constructor wrote becomes visible before any other thread can see the reference itself. The outer check is then safe: non-null means fully built." },
    { h: "What this bug is not", say: "Nobody is deadlocked: one thread already left the lock, and the other never wanted it. No signal is raised. The lock does not expire. The failure is a legal reorder that exposes a half-built object." },
  ],
  paint(d, frame) {
    d.card(36, 28, 390, 200, "Thread 1  ·  the builder", [
      frame === 0 ? "if (obj == null)" : "holds the lock",
      frame < 2 ? "about to construct" : "writes name, price",
      frame >= 4 ? "publish after writes" : "publish the pointer",
    ], frame >= 4 ? "good" : "hot");
    d.card(460, 28, 390, 200, "Thread 2  ·  the reader", [
      "if (obj == null)",
      frame >= 3 && frame < 4 ? "sees non-null, skips lock" : "has not entered",
      frame === 3 ? "reads price == 0" : frame >= 4 ? "reads price == 12" : "waiting to look",
    ], frame === 3 ? "bad" : frame >= 4 ? "good" : "mute");
    const fields = frame < 2 ? ["name: —", "price: —"] : frame === 2 || frame === 3 ? ["name: —", "price: 0"] : ["name: map", "price: 12"];
    d.card(36, 270, 390, 160, "Object on the heap", fields, frame === 3 ? "bad" : frame >= 4 ? "good" : "idle");
    d.card(460, 270, 390, 160, "The shared reference", [
      frame < 2 ? "obj = null" : "obj = pointer",
      frame >= 4 ? "volatile: ordered" : frame >= 2 ? "visible too early" : "not published",
    ], frame >= 2 && frame < 4 ? "warn" : frame >= 4 ? "good" : "idle");
  },
  notes: [
    { h: "The pattern, written slowly", p: [
      "There is one shared slot, `instance`, that should point at a single object. A plain lock around the whole check is correct and simple: every caller takes the lock, and only the first one constructs. People reached for double-checked locking because after startup the object already exists, and they did not want every call to take a lock just to discover that.",
      "The shape is: look once with no lock; if you see null, take the lock; look a second time, because another thread may have built it while you waited; if it is still null, construct and publish.",
    ], code: "if (instance == null) {\n  synchronized (lock) {\n    if (instance == null)\n      instance = new Thing();\n  }\n}\nreturn instance;" },
    { h: "Where the reorder hides", p: [
      "`new Thing()` does three kinds of work: allocate, run the constructor (write the fields), and store the address into `instance`. Other threads do not automatically see those writes in that order. A store to `instance` can become visible while a store to `price` is still sitting in a register or in this core's store buffer.",
      "The second thread is the one the lock does not cover. Its first read sees non-null, so it never enters `synchronized`. Locks only order the threads that actually take them. From Thread 2's point of view there was no lock, only a reference it trusted.",
    ] },
    { h: "What volatile changes", p: [
      "A volatile write cannot be reordered with earlier memory writes in a way that lets another thread see the write and miss those earlier ones. A volatile read cannot float ahead of the picture it is supposed to observe. Publishing a volatile reference is therefore a barrier: constructor first, pointer second, everywhere.",
      "In modern Java the safer everyday tool is a static holder class or an enum, which the language initializes safely. If you do write double-checked locking, the reference must be volatile. The same story, with different keywords, is why C++ needs an atomic with the right memory order and why a naked pointer publish is not enough.",
    ] },
    { h: "Naming the wrong answers so they stay wrong", p: [
      "Deadlock needs a cycle of waiting. The outer check does not wait. SIGSEGV means the CPU was asked to touch an address the process does not own. A half-built object is a real object at a legal address; its fields are just wrong, so you get bad data, not a signal.",
      "Intrinsic locks do not time out at 100ms. `wait(100)` is a different API, and it is about condition variables, not about this bug. If an option talks about timeouts, crashes, or deadlocks, it has left the actual failure mode.",
    ] },
  ],
});

window.LESSONS.push({
  id: 4,
  section: "Graphs and trees",
  nav: "Max XOR subarray",
  title: "The most opposite prefix",
  promise: "You will turn 'largest XOR of a contiguous subarray' into a walk down a binary tree of prefixes, one bit at a time, and see why that costs about 32 steps per element.",
  question: "Which data structure finds max XOR subarray in O(N * 32) time?",
  correct: 0,
  options: [
    { k: "A", t: "Binary Prefix Trie", why: "Insert every prefix XOR into a trie of bits. For each new prefix, walk the trie preferring the opposite bit. Each walk is 32 bits, and you do it N times." },
    { k: "B", t: "Fenwick (BIT) Tree", why: "A Fenwick tree totals or updates prefixes in O(log N). It does not answer 'which earlier prefix is farthest in XOR'. That question is about bits, not about sums." },
    { k: "C", t: "Suffix Automaton", why: "A suffix automaton compresses the substrings of a text. XOR of numbers is not a string-substring query. The shape is wrong for this problem." },
    { k: "D", t: "Disjoint Set Union", why: "Disjoint set union tracks which items have been joined into sets. It has no bit tests and no notion of a maximum XOR." },
  ],
  frames: [
    { h: "The subarray we want", say: "The numbers are 14, 7, and 8. XOR is the bit difference: a bit becomes 1 where the two numbers disagree. Among the contiguous pieces, 7 XOR 8 is 15, the largest possible here. Brute force would try every pair of endpoints." },
    { h: "A subarray is two prefixes", say: "Write a running XOR. Start at 0. After 14 the prefix is 14. After 14 XOR 7 the prefix is 9. After 9 XOR 8 the prefix is 1. A subarray from just after an old prefix to a new one is their XOR. 1 XOR 14 = 15, which is exactly 7 XOR 8." },
    { h: "Store prefixes as bit paths", say: "A binary trie is a tree whose left child means bit 0 and whose right child means bit 1. Each prefix becomes a path of 4 bits in this picture, or 32 bits in a real int. Sharing prefixes share a trunk." },
    { h: "Ask for the opposite bits", say: "When the newest prefix arrives, the best partner is the old prefix that differs in the most valuable bits. At each level, try the opposite bit first. If that child exists, take it. If not, take the only child you have." },
    { h: "The walk that scores 15", say: "The newest prefix is 0001. Its ideal partner is the bit-flip 1110. The trie has exactly the path 1, then 1, then 1, then 0, which is 14. 0001 XOR 1110 is 1111, which is 15. That is the answer." },
    { h: "Where the 32 comes from", say: "Nothing in the trie walk scans the array again. From the root to a leaf there is one step per bit. A 32-bit integer means at most 32 steps to insert, and 32 steps to query. Over N numbers the time is O(N · 32), which is O(N) with a bigger constant." },
    { h: "Why the other tools do not fit", say: "A Fenwick tree can tell you a prefix sum, not a maximum XOR against every earlier prefix. A suffix automaton is a string index. Disjoint sets only merge groups. The structure that branches on 0 and 1 is a binary trie of prefixes." },
  ],
  paint(d, frame) {
    if (frame === 0) {
      [["14", "1110", 80], ["7", "0111", 330], ["8", "1000", 580]].forEach(([dec, bits, x]) => {
        d.rect(x, 80, 180, 120, { tone: dec === "7" || dec === "8" ? "good" : "idle", rx: 10 });
        d.text(x + 90, 120, dec, { anchor: "middle", size: 28, mono: true });
        d.text(x + 90, 160, bits, { anchor: "middle", size: 16, mono: true, fill: "#787774" });
      });
      d.text(330, 250, "best subarray", { anchor: "middle", size: 14, fill: "#346538" });
      d.text(80, 340, "7 XOR 8  =  0111 XOR 1000  =  1111  =  15", { mono: true, size: 18, fill: "#346538" });
      return;
    }
    if (frame === 1) {
      const rows = [["before", "0000", "0"], ["after 14", "1110", "14"], ["after 7", "1001", "9"], ["after 8", "0001", "1"]];
      rows.forEach((row, i) => {
        const tone = i === 1 || i === 3 ? "good" : "idle";
        d.rect(80, 40 + i * 90, 700, 74, { tone, rx: 8 });
        d.text(110, 77 + i * 90, row[0], { size: 16 });
        d.text(360, 77 + i * 90, row[1], { mono: true, size: 18 });
        d.text(620, 77 + i * 90, row[2], { mono: true, size: 18 });
      });
      return;
    }
    const present = frame === 2 ? [] : frame === 3 ? ["0000"] : frame === 4 ? ["0000", "1110", "1001"] : ["0000", "1110", "1001", "0001"];
    drawXorTrie(d, present, frame >= 5 ? "1110" : null);
    if (frame >= 5) {
      d.text(40, 490, "Query 0001. Opposite path 1110 exists. XOR = 1111 = 15.", { size: 16, fill: "#346538" });
    } else if (frame === 3) {
      d.text(40, 490, "Only 0000 is stored, so the first query has no real choice yet.", { size: 16, fill: "#787774" });
    } else {
      d.text(40, 490, "Left child is bit 0. Right child is bit 1. The root is only a starting point.", { size: 16, fill: "#787774" });
    }
  },
  notes: [
    { h: "XOR in one minute", p: [
      "Write both numbers in binary. On each bit, XOR outputs 1 if the bits differ and 0 if they match. So XOR is large when the numbers disagree on the high bits. 7 is 0111 and 8 is 1000. They disagree everywhere, so their XOR is 1111, which is 15.",
      "Order inside a subarray does not matter, and doing XOR twice cancels: `x XOR x` is 0. That cancellation is the whole trick.",
    ] },
    { h: "Why prefixes replace subarrays", p: [
      "Let prefix[i] be the XOR of the first i numbers, and let prefix[0] be 0. The XOR of the subarray from index L to R is `prefix[R+1] XOR prefix[L]`. Everything before L was XORed twice, once inside each prefix, so it cancels. What remains is exactly the subarray.",
      "On 14, 7, 8 the prefixes are 0, 14, 9, 1. The winning pair is prefix 1 (binary 0001) and prefix 14 (binary 1110). Their XOR is 15, and the cancelled piece is the leading 14, leaving 7 XOR 8.",
    ] },
    { h: "How the trie chooses", p: [
      "Insert each prefix from the most significant bit downward. To maximize XOR with a new prefix, you want each bit to differ. At a node, look at the new prefix's bit and try the other child first. Take it if it exists. Otherwise you are forced down the matching bit and that bit of the XOR will be 0.",
      "You insert the old prefix before you query, or you query before you insert, but you must not pair a prefix with itself: `x XOR x` is 0, which is a useless empty subarray. Start with 0 already in the trie so a subarray from the beginning is allowed.",
    ] },
    { h: "The 32, and the traps", p: [
      "A fixed-width integer has a fixed number of bits: 32 for a usual int, 64 if the values are long. The trie depth is that width, not log of N. Hence O(N · 32). People still call it linear. If the exam writes O(N · 32), they are pointing at this trie and not at a Fenwick tree's O(N log N).",
      "Fenwick and segment trees answer range sums, minimums, and similar totals. A suffix automaton answers 'which substrings exist'. Disjoint set union answers 'are these two items in the same joined set'. None of them prefers an opposite bit.",
    ] },
  ],
});

function drawXorTrie(d, prefixes, hotPath) {
  const nodes = new Map();
  nodes.set("", { x: 430, y: 36, bit: "" });
  const slots = {
    "0": [250, 120],
    "1": [630, 120],
    "00": [180, 210],
    "01": [330, 210],
    "10": [540, 210],
    "11": [730, 210],
    "000": [140, 310],
    "001": [250, 310],
    "100": [500, 310],
    "111": [730, 310],
    "0000": [90, 410],
    "0001": [200, 410],
    "1001": [500, 410],
    "1110": [730, 410],
  };
  prefixes.forEach((bits) => {
    let path = "";
    for (const bit of bits) {
      const parent = path;
      path += bit;
      if (!nodes.has(path)) nodes.set(path, { x: slots[path][0], y: slots[path][1], bit });
      const a = nodes.get(parent);
      const b = nodes.get(path);
      const hot = hotPath && hotPath.startsWith(path);
      d.edge(a.x, a.y, b.x, b.y, { tone: hot ? "good" : "idle", r: 16, label: bit });
    }
  });
  nodes.forEach((n, path) => {
    if (!slots[path] && path !== "") return;
    const hot = hotPath && (path === hotPath || hotPath.startsWith(path));
    d.circle(n.x, n.y, path === "" ? 12 : 16, { tone: hot ? "good" : path ? "idle" : "ink" });
    if (path) d.text(n.x, n.y, n.bit, { anchor: "middle", size: 13, mono: true, fill: hot ? "#346538" : "#1c1917" });
  });
}

window.LESSONS.push({
  id: 5,
  section: "Graphs and trees",
  nav: "Fibonacci decrease-key",
  title: "Making a node smaller without climbing the heap",
  promise: "You will see a binary heap pay log N to decrease a key, and a Fibonacci heap cut the node loose in constant work, with the real bill deferred until delete-min.",
  question: "What is the amortized complexity of decreaseKey in a Fibonacci Heap?",
  correct: 0,
  options: [
    { k: "A", t: "O(1)", why: "Decrease the key, cut the node from its parent, and leave it as a new root. A cascading cut can walk upward, but each node is cut at most once per mark, so the average over many operations is O(1)." },
    { k: "B", t: "O(log N)", why: "That is decrease-key in a binary heap, which bubbles the node up the height. It is also the amortized cost of delete-min in a Fibonacci heap, not of decrease-key." },
    { k: "C", t: "O(N)", why: "Nothing in decrease-key scans the whole heap. A cascade follows parent pointers, and the accounting argument shows that walk is paid for in advance." },
    { k: "D", t: "O(sqrt(N))", why: "Square-root bounds show up in algorithms such as Mo's, or in some heaps with a different shape. They are not the Fibonacci-heap bound." },
  ],
  frames: [
    { h: "The operation, plainly", say: "Somewhere in a heap sits a node whose priority improves. Decrease-key means 'this value got smaller; put the heap back in a legal shape.' Dijkstra calls this when a shorter path to a city is found." },
    { h: "A binary heap climbs", say: "A binary heap is a tree where every parent is smaller than its children, packed into an array. If a node becomes smaller than its parent, it must swap upward. The tree is about log N levels tall, so one decrease can touch log N nodes." },
    { h: "A Fibonacci heap cuts", say: "Fibonacci heaps do not keep a single packed shape. They are a forest of little trees, and the minimum is always one of the roots. If a node becomes smaller, cut the link to its parent and make the node its own root. That is a few pointer writes." },
    { h: "The mark stops a tree rotting", say: "If you only cut, one parent could lose every child and become a long flat mess later. The rule: the first time a node loses a child, mark it. The second time, cut that node too and tell its parent. This cascading cut can walk up, which is why a single call is not worst-case O(1)." },
    { h: "Amortized means the average of a busy day", say: "Each mark was placed by an earlier decrease that did almost no work. We charge that earlier call for the later cut. Spread over a sequence, each decrease-key pays a constant. The expensive cleanup is delete-min, which links roots until no two roots share a degree, and that one is O(log N) amortized." },
    { h: "Read the options as names of other bounds", say: "O(log N) is the binary heap, and also Fibonacci delete-min. O(N) would be a scan. O(sqrt N) belongs to other structures. The reason Fibonacci heaps exist in textbooks is this O(1) decrease-key." },
  ],
  paint(d, frame) {
    d.text(70, 36, "Binary heap", { size: 14, fill: "#787774" });
    d.text(520, 36, "Fibonacci heap", { size: 14, fill: "#787774" });
    const left = [
      { id: "2", label: "2", x: 180, y: 90 },
      { id: "5", label: "5", x: 100, y: 190 },
      { id: "9", label: "9", x: 260, y: 190 },
      { id: "8", label: "8", x: 40, y: 300 },
      { id: "12", label: "12", x: 150, y: 300 },
    ];
    const cut = frame >= 2;
    const right = [
      { id: "2", label: "2", x: 620, y: 90, tone: frame >= 3 ? "warn" : "idle" },
      { id: "4", label: "4", x: 520, y: 190 },
      { id: "9", label: frame >= 1 ? "3" : "9", x: cut ? 760 : 720, y: cut ? 90 : 190, tone: "good" },
      { id: "7", label: "7", x: 470, y: 300 },
      { id: "11", label: "11", x: 580, y: 300 },
    ];
    d.graph(left, [
      { a: "2", b: "5", directed: false },
      { a: "2", b: "9", directed: false },
      { a: "5", b: "8", directed: false },
      { a: "5", b: "12", directed: false },
    ]);
    const redges = [
      { a: "2", b: "4", directed: false },
      { a: "4", b: "7", directed: false },
      { a: "4", b: "11", directed: false },
    ];
    if (!cut) redges.push({ a: "2", b: "9", directed: false, tone: "bad" });
    d.graph(right.map((n) => ({ ...n, tone: n.tone || "idle" })), redges);
    if (frame === 1) d.text(40, 430, "9 became small. In a binary heap it would swap up toward the root.", { size: 16, fill: "#1f6c9f" });
    if (frame >= 2) d.text(500, 430, "Cut. The decreased node is a new root beside the minimum.", { size: 16, fill: "#346538" });
    if (frame >= 3) d.text(40, 470, "Parent 2 is marked. A second lost child would cut 2 as well.", { size: 16, fill: "#956400" });
    if (frame >= 4) d.text(40, 500, "delete-min is the operation that links roots and pays O(log N).", { size: 15, fill: "#787774" });
  },
  notes: [
    { h: "What a heap is promising", p: [
      "A heap is a way to keep a set so you can always find the smallest item quickly, and you can insert items and remove the smallest. Dijkstra's algorithm also needs a third move: an item already in the set gets a better (smaller) priority. That move is decrease-key.",
      "If decrease-key is slow, Dijkstra is slow on sparse graphs, because a shorter path can be discovered many times. Fibonacci heaps were designed so that this particular move is cheap on average.",
    ] },
    { h: "The cut, in pointer language", p: [
      "A Fibonacci heap is a collection of trees. Every parent is smaller than the nodes under it. The roots are kept in a linked list, and a pointer remembers the smallest root. There is no rule that the tree is perfectly balanced today.",
      "To decrease a key: if the node is still bigger than its parent, just change the number. If it becomes smaller than its parent, the heap order would be a lie, so unlink it and add it to the root list. Update the minimum pointer if this node is now the smallest. No climb.",
    ] },
    { h: "Why 'amortized' is in the answer", p: [
      "Worst-case means one call on its own. Amortized means the average cost across a long sequence, using a prepaid account. The cascading cut can, on one unlucky call, walk from a leaf toward the root. The mark bit is the account: a node can be cut for free later only because an earlier decrease marked it and left a coin behind.",
      "The standard bounds, amortized: insert O(1), find-min O(1), decrease-key O(1), merge O(1), delete-min O(log N). Option B is the delete-min number, borrowed by mistake. The exam says decreaseKey.",
    ] },
    { h: "Where you will meet it again", p: [
      "The famous Dijkstra bound with a Fibonacci heap is O(E + V log V): each edge may decrease a key in O(1), and each vertex is deleted from the heap in O(log V). With a binary heap the same algorithm is O((V + E) log V).",
      "In practice, binary heaps are often faster because they are a tight array and Fibonacci heaps chase pointers. The exam is about the asymptotic bound, and that bound for decrease-key is O(1) amortized.",
    ] },
  ],
});

window.LESSONS.push({
  id: 6,
  section: "Graphs and trees",
  nav: "Bridges in Tarjan",
  title: "The edge whose removal splits the graph",
  promise: "You will learn two clocks on a depth-first search, tin and low, and the one comparison that says an edge is a bridge.",
  question: "In Tarjan algorithm, edge (u, v) is a bridge if:",
  correct: 0,
  options: [
    { k: "A", t: "low[v] > tin[u]", why: "v is the child of u in the depth-first tree. low[v] is the earliest discovery time anyone under v can reach. If that time is strictly later than u's discovery, nobody under v can climb back to u or above u, so (u, v) is the only link." },
    { k: "B", t: "low[v] <= tin[u]", why: "This is the opposite situation. A low value at or before u means there is a back edge out of v's side. The tree edge is then a spare path, not a bridge. Articulation points use a cousin of this test, with >=, on vertices rather than edges." },
    { k: "C", t: "tin[v] == tin[u]", why: "Discovery times are unique. Two different nodes never share a tin. This comparison is never true in a correct search." },
    { k: "D", t: "low[u] == low[v]", why: "Equal low values often mean 'these nodes can see the same ancestor'. That is a hint they sit in one bi-connected piece, which is evidence against an edge being a bridge." },
  ],
  frames: [
    { h: "A bridge is a single point of failure", say: "The graph is undirected. The triangle A–B–C has spare paths: remove any one triangle edge and everyone is still joined. The edge C–D is different. Remove it and D falls off. C–D is a bridge." },
    { h: "tin is the order we discover nodes", say: "Start depth-first search at A. A is discovered at time 1, B at 2, C at 3, D at 4. These discovery times only increase. They are a clock, not a distance." },
    { h: "low is the earliest ancestor you can see", say: "low starts equal to tin. A back edge may lower it. C has a back edge to A, so C can see time 1. D sees nobody older than itself, so low[D] stays 4. C does not inherit D's lateness in a way that erases the back edge: low[C] stays 1." },
    { h: "The comparison", say: "Look at the tree edge from parent u = C to child v = D. low[D] is 4 and tin[C] is 3. 4 > 3, so D's whole side has no way back to C except this edge. It is a bridge. For B–C, low[C] is 1 and tin[B] is 2. 1 > 2 is false, so B–C is not a bridge." },
    { h: "The inequality is the whole question", say: "low[v] <= tin[u] means 'there is a way back'. That is exactly when the edge is safe to delete. Choosing <= reports the edges that are not bridges. The bridge test is the strict greater-than." },
    { h: "A near miss you will see on another day", say: "A cut vertex, or articulation point, uses low[child] >= tin[node] for a child, plus a separate rule for the root. The equals sign is allowed there because landing on the node itself still means the child cannot get above it. Bridges do not use that equals." },
  ],
  paint(d, frame) {
    const tin = { A: 1, B: 2, C: 3, D: 4 };
    const low = { A: 1, B: 1, C: 1, D: 4 };
    const nodes = [
      { id: "A", x: 160, y: 150 },
      { id: "B", x: 360, y: 80 },
      { id: "C", x: 360, y: 250 },
      { id: "D", x: 620, y: 250 },
    ].map((n) => ({
      ...n,
      label: n.id,
      tone: n.id === "D" && frame >= 3 ? "warn" : frame >= 1 ? "hot" : "idle",
      sub: frame === 0 ? "" : frame === 1 ? "tin " + tin[n.id] : "L" + low[n.id] + " t" + tin[n.id],
    }));
    const bridge = frame >= 3;
    d.graph(nodes, [
      { a: "A", b: "B", directed: false, tone: frame >= 4 ? "good" : "idle" },
      { a: "A", b: "C", directed: false, bend: -20, tone: "idle", dash: frame >= 2 ? "5 4" : null, label: frame >= 2 ? "back" : "" },
      { a: "B", b: "C", directed: false },
      { a: "C", b: "D", directed: false, tone: bridge ? "bad" : "idle", label: bridge ? "bridge" : "" },
    ]);
    if (frame >= 3) {
      d.card(500, 36, 340, 120, "Test on C → D", ["low[D] = 4", "tin[C] = 3", "4 > 3  bridge"], "bad");
    }
    if (frame >= 4) {
      d.text(40, 430, "B → C: low[C] = 1, tin[B] = 2,  and  1 > 2 is false. Not a bridge.", { size: 16, fill: "#346538" });
    }
  },
  notes: [
    { h: "The picture to keep", p: [
      "Suppose the depth-first search has just walked from u to a new node v. That walk is a tree edge. The only way (u, v) fails to be a bridge is if v, or something found through v, has another edge that lands on u or on an ancestor of u. Then there is a second path, and deleting (u, v) does not disconnect the graph.",
      "low[v] compresses that observation into one number: the smallest discovery time reachable from v's subtree, using one back edge. If the best anyone can do is still newer than u, there is no second path.",
    ] },
    { h: "The two arrays", p: [
      "`tin[v]` (also called disc or dfn) is assigned once, when v is first discovered, from a clock that starts at 1 and goes up. All tin values are distinct.",
      "`low[v]` begins as tin[v]. When you see a back edge from v to an already discovered node w that is not v's parent, you may set `low[v] = min(low[v], tin[w])`. When a child returns, you may set `low[v] = min(low[v], low[child])`. You do not use the parent's tree edge as a back edge, or every edge would look safe.",
    ], code: "if v is child of u in the DFS tree\n  and low[v] > tin[u]:\n    (u, v) is a bridge" },
    { h: "Walk the example", p: [
      "Discovery: A 1, B 2, C 3, D 4. The edge from C back to A is not the edge we used to enter C (that was B–C or A–B depending on the walk; in this telling the tree is A–B–C and A–C is the back edge). low[C] becomes tin[A], which is 1. D has no back edge, so low[D] is 4.",
      "Edge C–D: 4 > 3, bridge. Edge B–C: low[C] = 1 which is not greater than tin[B] = 2. Edge A–B: low[B] becomes 1 through C, and 1 is not greater than tin[A] = 1. The triangle survives. D does not.",
    ] },
    { h: "The trap written as a cousin", p: [
      "Articulation points ask a vertex question. For a non-root u, if some child v has `low[v] >= tin[u]`, then removing u disconnects v from the ancestors. The equals is required: being able to reach u itself does not help you get above u once u is deleted.",
      "Bridges ask an edge question and use a strict `>`. If low[v] equals tin[u], v can see u by another route, so the tree edge is not the only route. Option B states that 'there is a way back' condition. It is useful, and it is the wrong direction for this sentence.",
    ] },
  ],
});

window.LESSONS.push({
  id: 7,
  section: "Algorithms and dynamic programming",
  nav: "TSP with bitmasks",
  title: "A tour remembered as a set of visited cities",
  promise: "You will see why the classic bitmask solution of the travelling salesman problem does about N²·2ᴺ steps, and why the other three expressions count a different amount of work.",
  question: "What is the optimal time complexity of TSP using Bitmask DP?",
  correct: 0,
  options: [
    { k: "A", t: "O(N^2 * 2^N)", why: "A state is a subset of cities plus the city you ended in: about N·2ᴺ states. From each state you try up to N unused cities as the previous (or next) stop. That extra N makes N²·2ᴺ." },
    { k: "B", t: "O(N!)", why: "N! is the number of orders of N cities, the brute-force tour list. Bitmask DP exists so we do not enumerate those orders. N! is a different algorithm." },
    { k: "C", t: "O(2^N)", why: "2ᴺ counts the subsets only. It forgets that each subset is paired with an ending city, and that each state tries many incoming edges. The DP is larger than this by about N²." },
    { k: "D", t: "O(N^3 * 2^N)", why: "A third factor of N appears if you add a loop the recurrence does not need, for example scanning every possible start inside every transition. The tight Held-Karp bound does not have it." },
  ],
  frames: [
    { h: "The problem", say: "A salesman starts at home, visits each city once, and returns home. You know the cost of every road. For a handful of cities you could try every order. The number of orders is N!, and N! becomes absurd well before N is large." },
    { h: "Remember a set, not a path", say: "Many different roads can lead to the same situation: 'I have visited exactly these cities, and I am standing in this one.' Those paths share a future. So a state is a pair: the set of visited cities, and the city you arrived in. The set is stored as a bitmask, one bit per city." },
    { h: "One transition", say: "To finish in city j with a particular set, you came from some other city i that is also in the set. The cost is the best cost of (set without j, ending at i), plus the road i→j. You try every legal i. That is the inner loop." },
    { h: "Count the loops for N = 4", say: "Four cities, so 2⁴ = 16 possible sets. For each set, up to 4 choices of the ending city: on the order of N·2ᴺ states. For each state, try up to 4 previous cities. 4² · 2⁴ = 256 elementary updates. The N³ version would be 1024. The subset-only count would be 16." },
    { h: "Why we still prefer it to N!", say: "At N = 4, listing the 24 tours is actually less work than 256 updates. The crossover comes later. At N = 10, N! is about 3.6 million and the DP is about 100 · 1024 = 102,400 updates. At N = 20, N! is astronomical and N²·2ᴺ is a few hundred million, which is heavy but thinkable. 'Optimal' here means the tight bound of this DP, not 'faster for every N'." },
    { h: "Where each wrong option comes from", say: "O(N!) is brute force. O(2ᴺ) stops after naming the masks and forgets both the endpoint and the loop over edges. O(N³·2ᴺ) is the same DP with an extra unnecessary loop. The recurrence as written is O(N²·2ᴺ) time and O(N·2ᴺ) memory." },
  ],
  paint(d, frame) {
    const cities = ["Home", "B", "C", "D"];
    cities.forEach((name, i) => {
      const x = 80 + i * 150;
      d.circle(x, 70, 28, { tone: i === 0 ? "ink" : "idle" });
      d.text(x, 70, name, { anchor: "middle", size: 14, fill: i === 0 ? "#fff" : "#1c1917" });
    });
    if (frame >= 1) {
      d.text(40, 130, "State example", { size: 13, fill: "#787774" });
      const bits = frame >= 2 ? "1110" : "1010";
      bits.split("").forEach((bit, i) => {
        d.rect(40 + i * 54, 150, 46, 46, { tone: bit === "1" ? "ink" : "idle", rx: 6 });
        d.text(63 + i * 54, 173, bit, { anchor: "middle", mono: true, fill: bit === "1" ? "#fff" : "#1c1917" });
      });
      d.text(280, 173, "visited set, as bits", { size: 15, fill: "#787774" });
      d.chip(560, 156, "end at C", "hot");
    }
    if (frame >= 2) {
      d.card(40, 230, 800, 110, "One jump into C", ["best(set without C, end at Home) + road(Home, C)", "best(set without C, end at B) + road(B, C)", "keep the smaller sum"], "idle");
    }
    if (frame >= 3) {
      const rows = [
        ["N!", "24", "brute-force orders", frame === 5 ? "bad" : "idle"],
        ["2^N", "16", "subsets only", "warn"],
        ["N^2 · 2^N", "256", "the DP", "good"],
        ["N^3 · 2^N", "1024", "an extra loop", "mute"],
      ];
      if (frame >= 4) {
        rows[0][1] = "3.6e6";
        rows[1][1] = "1024";
        rows[2][1] = "1.0e5";
        rows[3][1] = "1.0e6";
      }
      d.text(40, 370, frame >= 4 ? "Same formulas at N = 10" : "How much work at N = 4", { size: 14, fill: "#787774" });
      rows.forEach((row, i) => {
        d.rect(40 + i * 210, 390, 196, 90, { tone: row[3], rx: 8 });
        d.text(138 + i * 210, 418, row[0], { anchor: "middle", size: 14, mono: true });
        d.text(138 + i * 210, 448, row[1], { anchor: "middle", size: 18, weight: 600 });
      });
    }
  },
  notes: [
    { h: "What the mask is", p: [
      "Number the cities 0 through N-1. A subset becomes an integer whose bit i is on when city i has been visited. The integer runs from 0 to 2ᴺ − 1, so there are 2ᴺ subsets. That is the 'bit' in bitmask.",
      "The mask alone is not a state. The cost of having visited a set depends on where you are standing, because the next road starts there. The table is `dp[mask][end]`.",
    ] },
    { h: "The recurrence", p: [
      "Fix the start at city 0. Then `dp[mask][j]` is the cheapest way to start at 0, visit exactly the cities in mask, and finish at j. City j must be inside the mask.",
      "You arrived from some i in the mask, i ≠ j: `dp[mask][j] = min over i of ( dp[mask without j][i] + dist[i][j] )`. The full tour adds the road from the end back home, or you include home in the last step. Either way the shape of the loops does not change.",
    ], code: "for mask in all submasks that contain the start:\n  for end in cities inside mask:\n    for prev in cities inside mask, prev != end:\n      relax dp[mask][end]" },
    { h: "Counting without hand-waving", p: [
      "The mask loop runs 2ᴺ times. The end loop runs at most N times. The prev loop runs at most N times. Product: N · N · 2ᴺ. Some triples are skipped because end or prev is not in the mask, so this is an upper bound, and it is tight in the big-O sense. Memory is one number per state, O(N · 2ᴺ).",
      "If your implementation iterates the previous city by testing all N bits, you still have those three loops. You do not gain a fourth. That is why N³ · 2ᴺ is a looser bound people write when they also loop over the starting city inside the transition instead of fixing it.",
    ] },
    { h: "N! versus this DP", p: [
      "Listing permutations tries each full ordering separately, even when two orderings share a prefix set and an endpoint. The DP computes that shared situation once. That reuse is the entire point.",
      "For tiny N, the factorial is smaller and the code is simpler. The crossover is near N = 10 in the rough counts above, and by N = 20 only the DP is remotely plausible. The phrase 'optimal time complexity of TSP using Bitmask DP' asks for the DP's bound, which is O(N² · 2ᴺ).",
    ] },
  ],
});

window.LESSONS.push({
  id: 8,
  section: "Graphs and trees",
  nav: "LCA by binary lifting",
  title: "Climbing a tree in jumps of 1, 2, 4, 8",
  promise: "You will build a parent table of doubling jumps and use it to find the lowest common ancestor in a logarithmic number of steps, not a walk up every edge.",
  question: "Using Binary Lifting, what is the per-query time complexity for LCA?",
  correct: 0,
  options: [
    { k: "A", t: "O(log N)", why: "Each query lifts a node by the powers of two that make up the depth difference, then lifts both nodes together. A number up to N has O(log N) bits, so the query does O(log N) jumps." },
    { k: "B", t: "O(1)", why: "Constant-time LCA exists, but it is a different method: an Euler tour plus a range-minimum table. Binary lifting specifically pays a logarithm per query. The question names the method." },
    { k: "C", t: "O(sqrt(N))", why: "Square-root decomposition is a different acceleration. Binary lifting jumps by powers of two, which produces a logarithm, not a square root." },
    { k: "D", t: "O(N)", why: "Walking parent pointers one edge at a time is O(N) on a long chain. Binary lifting exists to avoid that walk." },
  ],
  frames: [
    { h: "The question on a tree", say: "The lowest common ancestor of two nodes is the deepest node that is an ancestor of both. For node 7 and node 5, you and a cousin share the grandparent 2. Node 1 is also a common ancestor, but it is higher, so it is not the lowest one." },
    { h: "First, know your parent", say: "up[node][0] is the ordinary parent. up[7][0] is 4. up[4][0] is 2. up[2][0] is 1. If every query walked these links one by one, a deep tree would make us climb N steps." },
    { h: "Then know your 2ᵏ-th ancestor", say: "up[node][k] is the node you reach by climbing 2ᵏ edges. It equals up[ up[node][k-1] ][k-1]: two half-jumps make a full jump. up[7][1] climbs 2 edges, to 2. up[7][2] climbs 4 edges. In this small tree that jump leaves the root, so we stop at 1. Building every jump costs O(N log N) once." },
    { h: "Bring them to the same depth", say: "Node 7 is deeper than node 5 by one edge. Write the difference in binary. One is just the 2⁰ bit, so a single jump of size 1 takes 7 up to 4. Now 4 and 5 are on the same level." },
    { h: "Jump together until the parents match", say: "From the largest jump downward: if jumping both nodes by 2ᵏ lands them on two different nodes, take the jump. If it lands on the same node, that jump would overshoot the ancestor, so refuse it. Here the parent of 4 and the parent of 5 are both 2, so we take no jump. The parent of either node is the LCA." },
    { h: "Count the jumps", say: "Depths are at most N. A depth has O(log N) bits, so equalizing depth is O(log N) jumps. The together-phase tries each bit once, another O(log N). The query is O(log N). O(1) would be the Euler-tour method. O(N) is the naive climb. This question said binary lifting." },
  ],
  paint(d, frame) {
    const nodes = [
      { id: "1", label: "1", x: 430, y: 70 },
      { id: "2", label: "2", x: 250, y: 170, tone: frame >= 4 ? "good" : "idle" },
      { id: "3", label: "3", x: 640, y: 170 },
      { id: "4", label: "4", x: 160, y: 280, tone: frame >= 3 ? "hot" : "idle" },
      { id: "5", label: "5", x: 360, y: 280, tone: frame >= 0 ? "hot" : "idle" },
      { id: "6", label: "6", x: 640, y: 280 },
      { id: "7", label: "7", x: 160, y: 400, tone: "warn" },
    ];
    d.graph(nodes, [
      { a: "1", b: "2", directed: false },
      { a: "1", b: "3", directed: false },
      { a: "2", b: "4", directed: false },
      { a: "2", b: "5", directed: false },
      { a: "3", b: "6", directed: false },
      { a: "4", b: "7", directed: false },
    ]);
    const lines = [
      "Query: LCA(7, 5)",
      "up[7][0] = 4",
      "up[7][1] = 2     jump of 2",
      "7 is one deeper. Jump 2^0 to 4.",
      "Parents of 4 and 5 are both 2.",
      "Query cost: O(log N) jumps",
    ];
    d.card(520, 400, 330, 90, "This step", [lines[frame]], frame >= 4 ? "good" : "hot");
  },
  notes: [
    { h: "Ancestor, said simply", p: [
      "In a rooted tree, the parent of a node is the next node toward the root. An ancestor is anyone you meet if you keep taking parents, including the node itself in some definitions. The lowest common ancestor of two nodes is the meeting point closest to them, not closest to the root.",
      "On the picture, 7's ancestors are 7, 4, 2, 1. The ancestors of 5 are 5, 2, 1. The common ones are 2 and 1. The deeper one is 2.",
    ] },
    { h: "The table", p: [
      "Pick a root. Depth of the root is 0. `up[v][0] = parent(v)`. Then `up[v][k] = up[ up[v][k-1] ][k-1]`, with a sentinel if the jump would pass the root. Column k stores a jump of length 2ᵏ. There are O(log N) columns because 2ᵏ passes N quickly.",
      "Filling the table is O(N log N). After that, every query reuses it. If you have many queries, that trade is the reason to preprocess.",
    ], code: "up[v][0] = parent[v]\nup[v][k] = up[ up[v][k-1] ][k-1]" },
    { h: "The query, as a procedure", p: [
      "If one node is deeper, lift only that node until the depths match. Do it with the binary expansion of the difference: if bit k of the difference is set, jump 2ᵏ. You never jump more than the depth, and you use each bit at most once.",
      "If the two nodes are now equal, that node is the answer. Otherwise lift both by the same amounts, largest jump first, but only when the two landing spots differ. When no jump is legal, both nodes sit just below the LCA, so take either parent.",
    ] },
    { h: "Why the other bounds belong to other methods", p: [
      "One-edge-at-a-time is O(N) per query on a chain, and needs no table. Euler tour + sparse table answers each LCA in O(1) after a heavier preprocess, by turning the tree into a range-minimum problem. That is option B, and it is not binary lifting.",
      "The exam names the method. Once the method is binary lifting, the per-query cost is the number of bits you may have to inspect, which is O(log N).",
    ] },
  ],
});

window.LESSONS.push({
  id: 9,
  section: "Concurrency and the machine",
  nav: "Circular wait",
  title: "Deadlock is a circle of 'you go first'",
  promise: "You will watch two threads each hold the lock the other needs, then see the one rule that makes that circle impossible: everyone acquires locks in the same global order.",
  question: "Which strategy reliably eliminates Circular Wait deadlock?",
  correct: 0,
  options: [
    { k: "A", t: "Strict global lock ordering", why: "Number every lock. Every thread must acquire the locks it needs in increasing order. A waiting edge then always points from a higher number to a lower one, so a cycle cannot close." },
    { k: "B", t: "Disabling CPU interrupts", why: "Turning interrupts off can protect a tiny kernel critical section on a single CPU. It does not order locks across cores, and user programs are not allowed to freeze the machine." },
    { k: "C", t: "Increasing thread priority", why: "Priority changes who runs, not which lock is taken first. A high-priority thread can still hold lock 2 while waiting for lock 1. That is how priority inversion starts, and it is not a cure for circular wait." },
    { k: "D", t: "Using busy-wait spinlocks", why: "A spinlock is still a lock. Two threads can spin forever, each holding the lock the other wants. You have replaced sleeping with burning CPU. The circle remains." },
  ],
  frames: [
    { h: "The four ingredients", say: "A deadlock of this classic kind needs four things at once: exclusive locks, threads that hold one lock while asking for another, no stealing of a lock, and a circle of waiting. Remove any one ingredient and this kind of deadlock cannot finish forming. This question removes the circle." },
    { h: "The circle itself", say: "Thread 1 holds the File lock and wants the Database lock. Thread 2 holds the Database lock and wants the File lock. Each is waiting for the other. Nothing moves. Draw the waits and you get a loop." },
    { h: "Give every lock a number", say: "Call File lock 1 and Database lock 2. The rule is not 'Thread 1 is special'. The rule is global: whichever locks you need, take the smaller number first. Both threads, and every future thread, use the same numbering." },
    { h: "The circle cannot close", say: "Both threads now want 1 before 2. One of them gets File. The other waits for File. It does not hold Database yet, so the first thread can take Database, finish, and release. Then the second thread proceeds. Somebody waits, but the wait is a line, not a circle." },
    { h: "What the rule does not fix", say: "Ordering removes circular wait only. Threads can still hold a lock for too long. They can still deadlock with a lock the order did not include, if someone breaks the rule once. It is reliable only when every acquisition in the program follows the same order." },
    { h: "The other strategies, placed", say: "Disabling interrupts is a single-CPU kernel trick, not a multicore lock policy. Raising priority does not change the order of acquire calls. Spinning waits actively instead of sleeping, and a circle of spinners is still a deadlock." },
  ],
  paint(d, frame) {
    const ordered = frame >= 3;
    d.card(40, 40, 360, 180, "Thread 1", ordered ? ["wants File then Database", frame >= 3 ? "order 1 then 2" : "holds File, waits"] : ["holds File (1)", "wants Database (2)"], frame >= 3 ? "good" : "bad");
    d.card(480, 40, 360, 180, "Thread 2", ordered ? ["wants Database and File", "still takes 1 then 2"] : ["holds Database (2)", "wants File (1)"], frame >= 3 ? "good" : "bad");
    if (!ordered && frame >= 1) {
      d.edge(220, 220, 660, 220, { label: "waits", tone: "bad", r: 0 });
      d.edge(660, 250, 220, 250, { label: "waits", tone: "bad", r: 0, bend: 40 });
      d.text(440, 360, "circular wait", { anchor: "middle", size: 18, fill: "#9f2f2d" });
    }
    if (ordered) {
      d.card(40, 270, 800, 150, "One legal order", ["1 File   →   2 Database", "Thread 2 waits for File and does not hold Database", "no cycle"], "good");
    }
  },
  notes: [
    { h: "Deadlock, without the vocabulary first", p: [
      "A lock is a token. Only one thread may hold a given token. Trouble starts when a thread keeps a token it already has and refuses to continue until it gets another one. If the thread who holds that other token is waiting back, both wait forever.",
      "Coffman wrote the four conditions that are all required: mutual exclusion, hold and wait, no preemption, and circular wait. 'Reliably eliminates circular wait' means a strategy that makes the fourth condition impossible, not merely unlikely.",
    ] },
    { h: "How ordering breaks the circle", p: [
      "Assign every lock in the whole program a distinct rank. A thread that needs several locks sorts those requests and acquires them from small rank to large rank. If it already holds a higher rank and discovers it needs a lower one, it must release and start again, or it must have taken them in order from the beginning.",
      "Suppose a cycle of waits existed. Each waiting thread would hold some lock and want a lock of a different rank. Following the cycle, the ranks cannot keep stepping upward and also return to the start. A total order has no cycle. That is the proof, in plain clothes.",
    ] },
    { h: "A tiny scene", p: [
      "File is 1, Database is 2. Thread A needs both and correctly takes File, then Database. Thread B needs both and also takes File first. If A already holds File, B blocks on File while holding nothing that A needs. A takes Database, works, releases both. B wakes up. The same code with B taking Database first is the deadlock scene from the picture.",
      "The numbers are arbitrary. What is not arbitrary is that there is one numbering, written down, used by every path. Two teams with two private conventions will recreate the circle at the boundary.",
    ] },
    { h: "Why the other fixes fail this particular condition", p: [
      "Disabling interrupts stops a single processor from switching threads in the middle of a few instructions. On two cores, the other core keeps running. It also does not define an order between File and Database. It is the wrong tool, and in user space it is not even available.",
      "Higher priority means the scheduler prefers you. The lock table does not care. You can be the most important thread in the system and still wait forever for a lock the other thread holds. A spinlock changes how you wait, from sleep to a loop, and a loop in a circle never finishes. None of these three remove the cycle.",
    ] },
  ],
});

window.LESSONS.push({
  id: 10,
  section: "Graphs and trees",
  nav: "Lazy segment trees",
  title: "A range update that refuses to touch every leaf",
  promise: "You will see a segment tree paint a whole span with one badge instead of rewriting every element, and why that badge is called lazy propagation.",
  question: "What technique enables O(log N) range updates in Segment Trees?",
  correct: 0,
  options: [
    { k: "A", t: "Lazy Propagation", why: "When an update covers a node completely, store the update on that node and stop. Children learn about it later, only if a future query or update needs to walk through them. A range then touches O(log N) nodes." },
    { k: "B", t: "Fractional Cascading", why: "Fractional cascading speeds up searching across a family of related sorted lists. It is not how a segment tree delays a range write." },
    { k: "C", t: "Heavy-Light Decomposition", why: "Heavy-light decomposition breaks a tree's paths into chains so path queries become segment-tree queries. It uses segment trees. It does not make their range updates logarithmic." },
    { k: "D", t: "Mo Algorithm", why: "Mo's algorithm answers offline array queries in about O((N+Q) √N) by moving a window. It is not a segment-tree update technique, and it is not O(log N) per update." },
  ],
  frames: [
    { h: "The slow way", say: "The array has eight zeros. Add 5 to every index from 3 through 6. If you edit the array directly, you write four cells. If the range were the whole array, you would write all N cells. A data structure that does that is not giving you a logarithmic update." },
    { h: "The tree above the array", say: "A segment tree puts the full range at the root and splits it in half until the leaves are single indexes. Each node owns a span. The leaves own 1, 2, 3, 4, 5, 6, 7, 8. We will not visit all of them." },
    { h: "Covered means stop", say: "Start at 1..8. It is only partly in 3..6, so go down. 1..4 and 5..8 are also partial. Then 3..4 is entirely inside 3..6. Stop, and remember '+5' on that node. 5..6 is entirely inside too. Stop there with '+5'. Indexes 1, 2, 7, 8 are outside, and their nodes are left alone." },
    { h: "The badge is the lazy value", say: "The leaves under 3..4 still say 0. That is allowed. The truth is 'the node says +5, and the children have not been told'. We touched a handful of nodes, about two per level, which is O(log N), not the four leaves and not all eight." },
    { h: "A later question pushes the badge down", say: "Suppose someone asks for index 3 alone. The walk from the root meets the badge on 3..4. Before answering, push: add 5 into the children (the leaves 3 and 4) and clear the badge. Now leaf 3 honestly says 5. Pushing happens along one path, still O(log N)." },
    { h: "Names that belong in other chapters", say: "Fractional cascading is about binary search in many lists. Heavy-light decomposition is about paths on a tree. Mo's algorithm slides a window in square-root blocks. The technique that makes the segment-tree range update O(log N) is lazy propagation." },
  ],
  paint(d, frame) {
    const tree = [
      { s: "1..8", x: 370, y: 30, w: 140 },
      { s: "1..4", x: 180, y: 120, w: 120 },
      { s: "5..8", x: 560, y: 120, w: 120 },
      { s: "1..2", x: 70, y: 220, w: 100 },
      { s: "3..4", x: 230, y: 220, w: 100 },
      { s: "5..6", x: 470, y: 220, w: 100 },
      { s: "7..8", x: 670, y: 220, w: 100 },
    ];
    const lazy = frame >= 3 ? { "3..4": "+5", "5..6": "+5" } : {};
    const hot = frame >= 2 ? { "3..4": "good", "5..6": "good", "1..8": "hot", "1..4": "hot", "5..8": "hot" } : {};
    const link = [
      [440, 78, 240, 120],
      [440, 78, 620, 120],
      [240, 168, 120, 220],
      [240, 168, 280, 220],
      [620, 168, 520, 220],
      [620, 168, 720, 220],
    ];
    link.forEach(([x1, y1, x2, y2]) => {
      d.el("line", { x1, y1, x2, y2, stroke: "#d6d3d1", "stroke-width": 1.25 });
    });
    tree.forEach((n) => {
      const tone = hot[n.s] || "idle";
      d.rect(n.x, n.y, n.w, 48, { tone, rx: 8 });
      d.text(n.x + n.w / 2, n.y + 24, lazy[n.s] ? n.s + "  " + lazy[n.s] : n.s, {
        anchor: "middle", size: 14, mono: true, fill: tone === "good" ? "#346538" : "#1c1917",
      });
    });
    const leaves = [1, 2, 3, 4, 5, 6, 7, 8];
    leaves.forEach((value, i) => {
      const pushed = frame >= 4 && (value === 3 || value === 4);
      const inside = value >= 3 && value <= 6;
      const tone = pushed ? "good" : inside && frame === 0 ? "warn" : "idle";
      const show = frame === 0 && inside ? 5 : pushed ? 5 : 0;
      d.rect(40 + i * 104, 360, 90, 70, { tone, rx: 8 });
      d.text(85 + i * 104, 388, "i=" + value, { anchor: "middle", size: 12, fill: "#787774" });
      d.text(85 + i * 104, 412, String(show), { anchor: "middle", size: 20, mono: true });
    });
    if (frame === 3) d.text(40, 470, "Leaves 3..6 still show 0. The +5 lives on the two covered nodes.", { size: 16, fill: "#956400" });
    if (frame >= 4) d.text(40, 470, "A query for index 3 pushes +5 down that path only.", { size: 16, fill: "#346538" });
  },
  notes: [
    { h: "What the tree is storing", p: [
      "A segment tree is a full binary tree over an array. The root owns every index. Each node owns a contiguous span, and its two children split that span. A leaf owns one index. If you only ever update one index, you walk one path from the leaf to the root and fix O(log N) nodes. Range updates are the part that becomes slow if you do them naively.",
      "Naive range update: walk down until you reach every leaf in the range, edit them, and walk back up. A range of length N touches O(N) nodes. The exam wants the version that stays O(log N) even when the range is long.",
    ] },
    { h: "The lazy idea", p: [
      "An update that completely covers a node's span does not need to visit the children now. The node can remember 'my whole span still needs +5'. That memory is the lazy tag. The node's own aggregate (its sum, its minimum, whatever you maintain) is updated immediately, so ancestors can be fixed on the way back.",
      "Children stay stale on purpose. They are told the truth only when some later operation walks through this node and actually needs a child. That telling is the push, or the propagation. Work is postponed, which is why it is called lazy.",
    ], code: "if node span is inside the update:\n  apply update to node\n  store it in lazy[node]\n  return\nif lazy[node] is set:\n  push to both children\nrecurse into the side or sides that overlap" },
    { h: "Why the time is logarithmic", p: [
      "At each level of the tree, a range update enters only a few nodes: the ones that straddle the borders, plus the covered nodes where it stops. The standard accounting is O(log N) nodes per update and O(log N) per query, because each operation follows a constant number of nodes on each of the log N levels.",
      "In the picture, adding 5 on indexes 3..6 stops at two nodes, 3..4 and 5..6, after a short walk from the root. It does not write leaves 3, 4, 5, and 6. A query that later needs leaf 3 pays for the push along its own path.",
    ] },
    { h: "Place the other names", p: [
      "Fractional cascading keeps 'fingers' from one sorted array into another so you can search K lists in about O(log N + K) instead of O(K log N). Heavy-light decomposition cuts a tree into heavy paths and puts a segment tree on each path. Mo's algorithm sorts offline queries so a left and right pointer move about √N blocks.",
      "You can use a lazy segment tree inside heavy-light decomposition. That does not make HLD the answer to this question. The technique that changes the range update from O(N) to O(log N) is the lazy tag.",
    ] },
  ],
});
