window.LESSONS = window.LESSONS || [];

window.LESSONS.push({
  id: 11,
  section: "Algorithms and dynamic programming",
  nav: "The KMP prefix table",
  title: "How far the pattern already matches itself",
  promise: "You will build the LPS table for a small pattern with your finger on the letters, and see that each entry is the longest proper prefix that is also a suffix.",
  question: "What does the KMP LPS table represent at index i?",
  correct: 0,
  options: [
    { k: "A", t: "Longest proper prefix matching a suffix", why: "For the substring pattern[0..i], lps[i] is the longest length that is both a prefix and a suffix, and is not the whole substring. Proper means we exclude the string matching itself, which would be a useless answer of i+1." },
    { k: "B", t: "Count of unique characters seen", why: "LPS stores a length of an overlap, not a count of distinct letters. Two patterns with the same letters in a different order have different tables." },
    { k: "C", t: "Rolling hash value of prefix", why: "A rolling hash is a number that fingerprints a string, used by Rabin-Karp. KMP does not hash. Its table is a length." },
    { k: "D", t: "Offset to next matching character", why: "The table is used to decide how far to shift, but the value stored is not itself the shift distance. The shift is derived from it: if len characters matched and then failed, the next comparison starts at index lps[len-1], which may be elsewhere in the pattern." },
  ],
  frames: [
    { h: "A prefix that is also a suffix", say: "Take the word abab, not including the whole word. The prefix ab is also the suffix ab. Its length is 2. The prefix a is also a suffix, but it is shorter. LPS wants the longest one. Proper means we refuse the cheap answer 'the whole string matches itself'." },
    { h: "Index 0 and 1", say: "Pattern: a b a b c. At index 0 the substring is just a. The only prefix is the whole thing, so the proper one is empty. lps[0] = 0. At index 1 the substring is ab. Its prefix a is not its suffix b. lps[1] = 0." },
    { h: "Index 2 finds a border of 1", say: "Substring aba. The first letter a equals the last letter a. That border has length 1, and there is no longer proper one. lps[2] = 1." },
    { h: "Index 3 finds a border of 2", say: "Substring abab. We already know aba has a border of 1, and the next letter continues it: pattern[1] is b, and the new letter is b. The border grows to ab, length 2. lps[3] = 2." },
    { h: "Index 4 falls off", say: "Substring ababc. We hoped to extend the border ab by one letter. The next letter in the pattern would need to be a, but we saw c. The shorter border also fails. lps[4] = 0. The finished table is 0, 0, 1, 2, 0." },
    { h: "Why the search bothers to store this", say: "While searching the text ababdababc, the pattern matches abab and then d disagrees with c. Four letters matched. The table says that matched piece abab already has a border of length 2. So the search does not restart at the first letter. It continues with the pattern's third letter against that same d. The stored thing is still the border length, not a hash and not a character count." },
  ],
  paint(d, frame) {
    const letters = ["a", "b", "a", "b", "c"];
    const lps = [0, 0, 1, 2, 0];
    const known = [1, 2, 3, 4, 5][Math.min(frame, 4)];
    letters.forEach((ch, i) => {
      const tone = frame >= 1 && i < known ? (frame === 5 ? "idle" : "hot") : "idle";
      d.rect(80 + i * 90, 40, 74, 74, { tone, rx: 8 });
      d.text(117 + i * 90, 77, ch, { anchor: "middle", size: 28 });
      d.text(117 + i * 90, 140, frame >= 1 && i < known ? String(lps[i]) : "·", {
        anchor: "middle", size: 20, mono: true, fill: "#1f6c9f",
      });
    });
    d.text(80, 180, "pattern on top,  lps underneath", { size: 14, fill: "#787774" });
    if (frame === 3) {
      d.text(80, 240, "a b a b", { mono: true, size: 22 });
      d.text(80, 280, "prefix ab  =  suffix ab    length 2", { size: 18, fill: "#346538" });
    }
    if (frame === 5) {
      const text = ["a", "b", "a", "b", "d", "a", "b", "a", "b", "c"];
      text.forEach((ch, i) => {
        d.rect(40 + i * 80, 250, 68, 60, { tone: i === 4 ? "bad" : i < 4 ? "good" : "idle", rx: 6 });
        d.text(74 + i * 80, 280, ch, { anchor: "middle", size: 22 });
      });
      d.text(40, 360, "text: abab matched, then d failed. Border length was 2, so do not restart at 0.", { size: 16, fill: "#1c1917" });
    }
  },
  notes: [
    { h: "The pieces of the word", p: [
      "A prefix is a starting slice: for ababc, the prefixes are a, ab, aba, abab, ababc. A suffix is an ending slice: c, bc, abc, babc, ababc. A border is a slice that is both, and proper means it is not the whole string. If we allowed the whole string, every index would store i+1 and the table would tell us nothing.",
      "LPS means longest prefix suffix, also called the pi table or the failure function. At index i it looks only at pattern[0..i], the pattern up to and including that letter. It does not look at the text.",
    ] },
    { h: "The table for ababc", p: [
      "Index 0, string a: lps 0. Index 1, ab: lps 0. Index 2, aba: the letter a is a border, lps 1. Index 3, abab: ab is a border, lps 2. Index 4, ababc: c continues neither the border of length 2 (which wanted a) nor the empty border. lps 0.",
      "You can build it in linear time with the same idea the search uses. Keep a length of the current border. If the next letter matches pattern[length], the border grows. If it does not, fall back to lps[length-1] and try the shorter border. That fallback is why the table is able to build itself.",
    ], code: "pattern:  a b a b c\nlps:      0 0 1 2 0" },
    { h: "How the search spends the table", p: [
      "KMP never re-reads a text character backward. When a mismatch happens after `len` matched letters, the matched text is equal to the matched pattern, and that pattern piece has a border of length `lps[len-1]`. Those border characters are already known to match the text. The next comparison uses pattern index `lps[len-1]`.",
      "So the table's content is a length. The shift of the pattern window is something you compute from that length. An option that says 'offset to the next character' is describing a use of the table, not the value sitting in the cell. Unique counts and rolling hashes are other string tools with other tables.",
    ] },
    { h: "The advanced step", p: [
      "Because each text character is consumed once and the border length only climbs and falls in a controlled way, both the preprocessing and the search are O(N + M): text length plus pattern length. The naive search can be O(N · M) on a pattern like aaaa against a text of a's.",
      "A related trap: the failure link is sometimes written so that on a mismatch you jump before comparing again. The stored number is still that longest proper border. If you remember only one sentence, remember that one.",
    ] },
  ],
});

window.LESSONS.push({
  id: 12,
  section: "Concurrency and the machine",
  nav: "The ABA problem",
  title: "The value came back, and the test was fooled",
  promise: "You will watch a memory cell go from A to B and back to A while a compare-and-swap is asleep, and see why 'it still says A' is not proof that nothing happened.",
  question: "What issue occurs when memory changes A -> B -> A between CAS reads?",
  correct: 0,
  options: [
    { k: "A", t: "The ABA Problem", why: "Compare-and-swap only checks that the bits are A again. It cannot see that they left and came back. The second A may mean a different generation of the data, often a freed and reused node." },
    { k: "B", t: "Priority Inversion", why: "Priority inversion is a scheduler problem: a high-priority thread waits for a low-priority one that holds a lock, while a medium-priority thread keeps running. No CAS and no A-B-A story." },
    { k: "C", t: "Convoy Effect", why: "A lock convoy is a traffic jam behind a lock: when the holder is descheduled, everyone else piles up, and the lock passes slowly from one waking thread to the next. It is not a false CAS success." },
    { k: "D", t: "False Sharing", why: "False sharing is a performance problem of unrelated variables sharing a cache line. The values do not need to change A to B to A, and CAS is not fooled by it. That is the next-but-one lesson's topic, under its own name." },
  ],
  frames: [
    { h: "What CAS promises", say: "Compare-and-swap says: if this memory still holds the value I saw, replace it with my new value, and do that as one indivisible step. It is the brick lock-free stacks are built from. It compares values. It does not remember history." },
    { h: "Thread 1 reads A", say: "A stack's top pointer is node A, and A.next is node B. Thread 1 wants to pop. It reads top = A and plans to swing top forward to B. Before it commits, the scheduler pauses it." },
    { h: "Someone else does real work", say: "Thread 2 pops A. Top is now B. Thread 2 pops B as well. Then it pushes A back, maybe from a free list. Top is A again. The bits look like the start, but B may be freed, and A.next may no longer be the old B." },
    { h: "The CAS succeeds for the wrong reason", say: "Thread 1 wakes up and CAS-es top from A to B. The cell contains A, so the compare passes. Top becomes B. If B was freed, the stack now points at garbage. The change A → B → A happened entirely between the read and the successful CAS." },
    { h: "Why a version number fixes the shape", say: "Store a counter beside the pointer, or inside the same atomic word. Every successful pop or push bumps the counter. The CAS must match both the pointer and the counter. When A comes back, the counter has moved, so the compare fails and Thread 1 retries. Same idea: a tagged pointer." },
    { h: "The other names are real bugs, different ones", say: "Priority inversion is about scheduling and locks. A convoy is a queue stuck on one lock. False sharing is cache lines bouncing between cores. None of them is 'the bits returned to A and CAS believed the world was unchanged'." },
  ],
  paint(d, frame) {
    const tops = ["A", "A", "A", "B", "A"];
    const shown = frame === 0 ? "A" : frame === 1 ? "A" : frame === 2 ? "B" : frame === 3 ? "A" : "A";
    const mid = frame === 2;
    d.card(40, 40, 240, 150, "top pointer", [shown], frame === 3 ? "bad" : "hot");
    d.card(320, 40, 240, 150, "Thread 1 believes", [frame === 0 ? "nothing yet" : "top is A", frame >= 3 ? "CAS A → B succeeds" : "plans CAS A → B"], frame === 3 ? "bad" : "idle");
    d.card(600, 40, 240, 150, "Thread 2", [frame < 2 ? "not running" : frame === 2 ? "pop A, pop B" : frame >= 3 ? "pushed A back" : "", frame >= 4 ? "version bumped" : ""], frame === 2 ? "warn" : "idle");
    const story = ["start", "A is read", "top moved to B", "top is A again", "tags would not match"];
    ["A", "B", "A"].forEach((value, i) => {
      const on = (frame === 1 && i === 0) || (frame === 2 && i === 1) || (frame >= 3 && i === 2);
      d.circle(160 + i * 220, 320, 36, { tone: on ? "warn" : "idle" });
      d.text(160 + i * 220, 320, value, { anchor: "middle", size: 22, weight: 600 });
      if (i < 2) d.edge(196 + i * 220, 320, 344 + i * 220, 320, { r: 0, directed: true });
    });
    d.text(160, 400, story[Math.min(frame, 4)], { anchor: "middle", size: 16, fill: "#787774" });
    d.text(380, 400, "A  →  B  →  A", { anchor: "middle", size: 16, fill: mid || frame >= 3 ? "#9f2f2d" : "#787774" });
    if (frame >= 4) d.text(600, 400, "A#1  →  B#2  →  A#3", { anchor: "middle", size: 16, fill: "#346538" });
  },
  notes: [
    { h: "CAS in one sentence", p: [
      "A thread reads a word, thinks, and later tries to publish. Another thread may have written that word in between. Compare-and-swap closes the race only against a word that is still the expected bits: if `memory == expected`, store `new`, and report whether you won. The whole check-and-store is atomic.",
      "Atomic does not mean 'nothing else happened while I was asleep'. It means nobody else wrote in the middle of my check itself. They are free to have written before it, including a write that restored the old bits.",
    ] },
    { h: "The stack story", p: [
      "Lock-free pop: read top into `a`, read `a.next` into `next`, then CAS top from `a` to `next`. If the CAS fails, someone else popped or pushed, so retry. If it succeeds, you believe `a` was really the top the whole time and `next` is the rightful new top.",
      "ABA breaks that belief. Thread 2 can pop `a`, pop `next`, free `next`, and push `a` again. Thread 1's CAS sees top equal to `a` and swings it to a `next` that has been freed or reused as a different node. The bits matched. The structure did not.",
    ] },
    { h: "The usual repairs", p: [
      "A tag or version beside the pointer makes 'A' and 'A again' into different values. The CAS expected value includes the tag it first observed. Any intervening pop bumps the tag, so the late CAS fails. Hazard pointers and epoch reclamation solve the related problem of 'when is it actually safe to free the node', which ABA and use-after-free share a doorway with.",
      "You do not need a stack to be asked this question. Any CAS whose meaning is 'this pointer still identifies the same generation of the object' can be fooled by a recycled address. The name of that fooling is ABA.",
    ] },
    { h: "Do not merge it with the neighboring bugs", p: [
      "Priority inversion: low-priority thread holds a lock, high-priority thread waits, medium-priority threads run ahead of the low one, so the high one waits even longer. The cure involves priority inheritance, not version tags.",
      "Convoy effect: many threads queue on one lock, and each context switch hands the lock to the next sleeper slowly. False sharing: two cores write different variables that happen to live on one cache line. Both are in this paper. Neither is a value leaving and returning.",
    ] },
  ],
});

window.LESSONS.push({
  id: 13,
  section: "Graphs and trees",
  nav: "Bellman-Ford cycles",
  title: "The extra pass that should have done nothing",
  promise: "You will relax every edge once per round, watch legal distances settle, then add one negative loop and see a later round still find an improvement. That leftover improvement is how Bellman-Ford reports a negative cycle.",
  question: "How does Bellman-Ford detect reachable negative cycles?",
  correct: 0,
  options: [
    { k: "A", t: "An edge relaxes on the V-th iteration", why: "With no negative cycle, V-1 full passes over the edges are enough for every simple path. A V-th pass that can still improve a distance means a walk got cheaper by repeating a cycle. That cycle is negative, and it can reach the improved vertex." },
    { k: "B", t: "In-degree of a vertex exceeds V-1", why: "In-degree is a count of incoming edges, a static property of the drawing. It does not change during Bellman-Ford, and a high in-degree does not mean a negative cycle." },
    { k: "C", t: "Visited queue becomes empty", why: "An empty queue is how BFS or Kahn's topological sort notices that it is finished. Bellman-Ford does not use that queue as its cycle test." },
    { k: "D", t: "Path distance reaches zero", why: "Zero is a legal distance. A path can cost 0 with no cycle at all. The signal is 'a distance changed when it should have been finished', not 'a distance is zero'." },
  ],
  frames: [
    { h: "Relax means 'try this edge'", say: "A distance label is the cheapest walk we have found from the source so far. Relaxing an edge u→v means: if dist[u] + weight is cheaper than dist[v], adopt it. Bellman-Ford repeats that for every edge, in rounds." },
    { h: "Why V − 1 rounds are the honest ones", say: "A simple path has at most V − 1 edges, because a V-th edge on V vertices would repeat a vertex. If there is no negative cycle, some cheapest path is simple. After V − 1 rounds, every such path has had time to be discovered. Further rounds should change nothing." },
    { h: "A calm graph settles", say: "Three vertices, so two honest rounds. Edges A→B weight 1, B→C weight 1, A→C weight 100. Start A at 0. After round 1, B is 1 and C is 2. Round 2 changes nothing. Round 3, the extra one, changes nothing. Report: no negative cycle reached from A." },
    { h: "Add a loop that pays you", say: "Add C→A with weight −5. The loop A→B→C→A costs 1 + 1 − 5 = −3. Each time you walk it, every distance on it can drop by 3. There is no cheapest path anymore, because you can always take the loop again." },
    { h: "The extra round still moves", say: "Round 1 now ends with A at −3, not 0, because C→A fires. Round 2 drops the numbers again. Round 3 drops them once more: an edge still relaxes on the V-th iteration. That is the detector. The algorithm does not look at in-degrees, empty queues, or a distance of zero." },
    { h: "Reachable matters", say: "The sentence in the question says reachable. A negative cycle in a corner the source cannot touch will not change the source's distances, and this test will not see it. If you need every cycle in the graph, run the same idea from every vertex, or add a dummy source with a zero-edge to all vertices." },
  ],
  paint(d, frame) {
    const nodes = [
      { id: "A", label: "A", x: 180, y: 150 },
      { id: "B", label: "B", x: 430, y: 70 },
      { id: "C", label: "C", x: 430, y: 250 },
    ];
    const edges = [
      { a: "A", b: "B", label: "1", bend: -10 },
      { a: "B", b: "C", label: "1", bend: 20 },
      { a: "A", b: "C", label: "100", bend: 10 },
    ];
    if (frame >= 3) edges.push({ a: "C", b: "A", label: "-5", bend: 50, tone: "bad" });
    d.graph(nodes, edges);
    const tables = {
      2: ["A 0", "B 1", "C 2", "round 3: still"],
      3: ["cycle -3", "no best path", "", ""],
      4: ["round 3 still", "lowers A", "that is the", "signal"],
    };
    if (frame >= 2) {
      const lines = tables[frame] || ["round 3 moved", "A keeps falling", "reachable cycle", "that is the test"];
      d.card(560, 160, 280, 180, frame >= 4 ? "V-th pass" : "Distances from A", lines, frame >= 4 ? "bad" : "idle");
    }
    if (frame === 2) d.text(40, 430, "V = 3. After 2 passes, C is 2. Pass 3 does not relax anything.", { size: 16, fill: "#346538" });
    if (frame >= 4) d.text(40, 470, "A pass numbered V can still update a distance. Negative cycle.", { size: 16, fill: "#9f2f2d" });
  },
  notes: [
    { h: "The algorithm before the detector", p: [
      "Set the source distance to 0 and every other distance to infinity. Then, V − 1 times, look at every edge and relax it. Order of edges inside a round can change how early a path appears, which is why we repeat. After enough rounds, a simple path of any length up to V − 1 has been assembled.",
      "Relax is the same step Dijkstra uses. The difference is who you relax. Dijkstra always extends the currently closest settled vertex, and that argument needs non-negative weights. Bellman-Ford tries everyone, so a negative edge is allowed.",
    ] },
    { h: "What the extra iteration means", p: [
      "Suppose a V-th pass still relaxes some edge u→v. Then there is a walk from the source to v that uses at least V edges and is cheaper than every shorter walk we had. A walk with V edges on V vertices repeats a vertex. The repeated part is a cycle. It was worth taking, so its total weight is negative.",
      "People count the passes in two ways and then doubt themselves. If vertices are V, the constructing passes are numbered 1 through V − 1. The detecting pass is the next one, often called the V-th iteration. The option's wording matches that count. Some code writes `for (int i = 0; i < V; i++)` and treats a success on the last index as the cycle. Same test.",
    ], code: "repeat V - 1 times:\n  relax every edge\none more pass:\n  if any edge still relaxes:\n    negative cycle can reach that vertex" },
    { h: "The numbers in the picture", p: [
      "Without C→A: round 1 sets B = 0+1 and C = 1+1 = 2 (the direct edge of 100 loses). Round 2 and round 3 are quiet. With C→A weight −5: once C is 2, A becomes 2−5 = −3. Next round B becomes −2, C becomes −1, A becomes −6. The labels keep falling on the third pass. There is no 'shortest' left to find.",
      "A distance of 0 would not have told us this. The calm graph also has a distance 0, at the source. An empty queue is a BFS or a topological sort finishing cleanly. In-degree never changes while you relax.",
    ] },
    { h: "The advanced caution", p: [
      "The test reports a negative cycle that can affect some dist[] you are computing, which means the source can reach it. An unreachable negative cycle stays invisible unless you give the algorithm a way to reach every vertex.",
      "If the graph is a DAG, you do not need Bellman-Ford at all: relax edges in topological order, once, even with negative weights. The V-th pass is interesting only when a cycle is possible. Dijkstra cannot replace this test. The next lesson but one is exactly why.",
    ] },
  ],
});

window.LESSONS.push({
  id: 14,
  section: "Algorithms and dynamic programming",
  nav: "Matrix chain order",
  title: "Where to put the parentheses",
  promise: "You will multiply three small matrices both ways, see the costs differ, and count the three nested loops that make the general solution O(N³).",
  question: "What is the time complexity of Matrix Chain Multiplication DP?",
  correct: 0,
  options: [
    { k: "A", t: "O(N^3)", why: "A state is a subchain, and there are O(N²) subchains. Each subchain tries every split point between its ends. That third loop makes O(N³) time. The table itself occupies O(N²) memory, which is the usual trap." },
    { k: "B", t: "O(N^2)", why: "O(N²) is the number of subchains, and it is the memory. Filling each cell is not O(1). The split loop costs up to O(N) per cell, so time is one order higher than space." },
    { k: "C", t: "O(N log N)", why: "Nothing is halved here. Every subchain and every split is considered. This bound belongs to sorting-style divide and conquer, not to this table." },
    { k: "D", t: "O(2^N)", why: "The recursive explosion without memory is exponential, because the same subchain is solved many times. The DP stores each subchain once. After that, the cost is the polynomial O(N³), not 2ᴺ." },
  ],
  frames: [
    { h: "Parentheses change the work", say: "Matrix A is 2 by 3, B is 3 by 4, C is 4 by 2. Multiplying a P×Q matrix by a Q×R matrix costs P·Q·R scalar products and yields a P×R matrix. The final shape is the same either way: 2 by 2. The amount of arithmetic is not." },
    { h: "Left to right costs 40", say: "A times B costs 2·3·4 = 24 and makes a 2×4 matrix. That times C costs 2·4·2 = 16. Total 40. The middle dimension is what you pay, and here the middle dimensions were 3 and then 4." },
    { h: "Right to left costs 36", say: "B times C costs 3·4·2 = 24 and makes a 3×2 matrix. A times that costs 2·3·2 = 12. Total 36. Same product, fewer scalar multiplications. The DP's job is to find this kind of choice for a long chain, not to multiply the matrices." },
    { h: "A cell is a subchain", say: "Let dp[i][j] be the cheapest way to multiply matrices i through j. A chain of one matrix costs 0. A chain of two has only one split. A longer chain tries every place to cut: the left part, the right part, plus the cost of multiplying those two results." },
    { h: "Three loops", say: "Loop 1: length of the subchain, from 2 up to N. Loop 2: where that subchain starts. Loop 3: where you split it. Each loop runs O(N) times. O(N)·O(N)·O(N) is O(N³). For N = 100 that is about a million steps. N² would be about ten thousand, which only counts the cells, not the work inside them." },
    { h: "Space is the decoy", say: "You store one answer per pair (i, j), so memory is O(N²). Option B is that number, promoted by mistake into a time bound. The exponential option is what you pay if you recurse on splits and never save a subchain. With the table, time is cubic." },
  ],
  paint(d, frame) {
    const mats = [
      ["A", "2×3"],
      ["B", "3×4"],
      ["C", "4×2"],
    ];
    mats.forEach((m, i) => {
      const tone = frame === 1 && i < 2 ? "hot" : frame === 2 && i > 0 ? "hot" : "idle";
      d.rect(60 + i * 200, 36, 150, 80, { tone, rx: 8 });
      d.text(135 + i * 200, 64, m[0], { anchor: "middle", size: 18 });
      d.text(135 + i * 200, 92, m[1], { anchor: "middle", size: 16, mono: true, fill: "#787774" });
    });
    if (frame === 1) d.card(60, 160, 700, 120, "(A B) C", ["2·3·4 = 24", "then 2·4·2 = 16", "total 40"], "warn");
    if (frame === 2) d.card(60, 160, 700, 120, "A (B C)", ["3·4·2 = 24", "then 2·3·2 = 12", "total 36"], "good");
    if (frame >= 3) {
      d.card(60, 160, 700, 130, "The split", ["dp[i][j] = min over k of", "dp[i][k] + dp[k+1][j] + rows[i]·cols[k]·cols[j]"], "idle");
    }
    if (frame >= 4) {
      ["for length", "for start i", "for split k"].forEach((label, i) => {
        d.rect(60 + i * 230, 330, 210, 70, { tone: "hot", rx: 8 });
        d.text(165 + i * 230, 365, label, { anchor: "middle", size: 16 });
      });
      d.text(60, 440, "three nested O(N) loops  →  O(N³) time,   O(N²) memory", { size: 16, fill: "#1f6c9f" });
    }
  },
  notes: [
    { h: "What is being chosen", p: [
      "You are not allowed to reorder the matrices. AB is not BA. You are only allowed to choose which adjacent pair happens first, which is exactly where the parentheses go. Associativity says the answers match. It does not say the work matches.",
      "A chain is described by the dimensions along the boundaries. Our three matrices need four numbers: 2, 3, 4, 2. Matrix i has dimensions p[i-1] by p[i]. The cost of multiplying a left result that spans up to k with a right result that starts after k is p[i-1] · p[k] · p[j].",
    ] },
    { h: "The cell and the split", p: [
      "dp[i][j] depends only on shorter subchains: the left piece ends at or before k, the right piece starts at or after k+1, and both are strictly inside i..j. If you fill the table by increasing length, those pieces are already known. This is why the length loop is the outer one.",
      "For our chain, the two-matrix cells are 24 and 24. The full chain tries k between A and B, giving 0 + 24 + 2·3·2 = 36, and k between B and C, giving 24 + 0 + 2·4·2 = 40. The min is 36. The DP found the better parentheses.",
    ], code: "for length = 2 .. N:\n  for i = 1 .. N-length+1:\n    j = i + length - 1\n    for k = i .. j-1:\n      candidate = dp[i][k] + dp[k+1][j]\n                + p[i-1] * p[k] * p[j]" },
    { h: "Time versus memory", p: [
      "How many pairs (i, j) are there? About N² / 2. That is the size of the table, and it is option B's number. For each pair whose length is L, there are L − 1 splits. Summing L over the table produces a cubic. You can remember it as 'N² cells, each spending O(N)'.",
      "The naive recursion without a table recomputes the same subchain inside many parenthesizations, and that tree is exponential. Memoizing, or filling bottom-up, is what knocks it down to O(N³). Option D describes the version before dynamic programming.",
    ] },
    { h: "A step past the exam", p: [
      "There is a faster algorithm for the matrix-chain optimum, due to Hu and Shing, that runs in O(N log N). It is not the DP this question means. Course questions that write 'Matrix Chain Multiplication DP' and offer O(N³) beside O(N²) are asking you to separate the cubic filling from the quadratic table.",
      "The same triple loop appears whenever a state is an interval and a transition tries every cut: optimal binary search trees, bursting balloons, and palindrome cuts are cousins. When you see an interval DP, expect O(N²) states and often O(N³) time.",
    ] },
  ],
});

window.LESSONS.push({
  id: 15,
  section: "Concurrency and the machine",
  nav: "False sharing",
  title: "Two variables, one cache line, a fight",
  promise: "You will see two cores update two different variables that happen to sit in the same 64-byte line, and watch the hardware treat those updates as a conflict.",
  question: "What causes False Sharing across multiple CPU cores?",
  correct: 0,
  options: [
    { k: "A", t: "Independent variables in same cache line", why: "The cores do not share a variable. They share the block of memory the cache moves around. A write to either variable invalidates the whole line on the other core, so the cores bounce that line even though the program variables are independent." },
    { k: "B", t: "Threads reading from unallocated heap", why: "Reading unallocated memory is a bug, often a crash or a garbage value. False sharing happens on perfectly legal, allocated variables. It is a performance problem, not an invalid pointer." },
    { k: "C", t: "Deadlocks from re-entrant mutexes", why: "A re-entrant mutex is about whether the same thread may lock twice. It can be involved in deadlocks. It does not move cache lines." },
    { k: "D", t: "GC pause across CPU cores", why: "A garbage collector can stop cores, but that pause is not false sharing. False sharing occurs in languages with no garbage collector at all. It is a hardware coherence effect." },
  ],
  frames: [
    { h: "What a cache line is", say: "A core does not fetch one integer from memory. It fetches a block, classically 64 bytes, and keeps that block in its cache. Call the block a line. Every other core that wants any byte of that block is talking about the same line." },
    { h: "Two honest variables", say: "Core 1 owns a counter x. Core 2 owns a counter y. The program never uses them together. They are neighbors in memory only because a struct, or two adjacent allocations, placed them 4 bytes apart. Both fit inside one 64-byte line." },
    { h: "A write claims the whole line", say: "When Core 1 writes x, the cache protocol marks the line exclusive to Core 1. Core 2's copy is invalidated, even the bytes that hold y, which Core 1 did not change. For Core 2 to write y, the line must travel back. Core 1's copy is then invalidated." },
    { h: "The bounce", say: "If both cores update in a tight loop, the line crosses the interconnect on every write. The program is correct. The counters are right. The cores are just slow, because each is throwing away the other's cache. That slowdown is false sharing. True sharing would be both cores writing the same variable." },
    { h: "Padding puts them on different lines", say: "Move y at least 64 bytes away from x, with padding the program never reads. Now a write to x invalidates x's line only. Core 2 keeps y. The variables were always independent. The layout was the bug." },
    { h: "What it is not", say: "Nobody read freed memory. Nobody deadlocked a mutex. The garbage collector, if there is one, is not the cause. The cause is independent variables living in the same cache line while several cores write them." },
  ],
  paint(d, frame) {
    d.text(80, 40, "Core 1", { size: 14, fill: "#787774" });
    d.text(560, 40, "Core 2", { size: 14, fill: "#787774" });
    d.rect(60, 60, 220, 80, { tone: frame === 2 || frame === 3 ? "hot" : "idle", rx: 8 });
    d.text(170, 100, "writes x", { anchor: "middle", size: 18 });
    d.rect(560, 60, 220, 80, { tone: frame === 3 ? "warn" : "idle", rx: 8 });
    d.text(670, 100, "writes y", { anchor: "middle", size: 18 });
    const split = frame >= 4;
    if (!split) {
      d.rect(80, 220, 680, 90, { tone: frame >= 2 ? "bad" : "idle", rx: 8 });
      d.text(250, 265, "x", { anchor: "middle", size: 22, mono: true });
      d.text(590, 265, "y", { anchor: "middle", size: 22, mono: true });
      d.text(420, 340, "one cache line, 64 bytes", { anchor: "middle", size: 14, fill: "#787774" });
    } else {
      d.rect(80, 220, 280, 90, { tone: "good", rx: 8 });
      d.rect(480, 220, 280, 90, { tone: "good", rx: 8 });
      d.text(220, 265, "x", { anchor: "middle", size: 22, mono: true });
      d.text(620, 265, "y", { anchor: "middle", size: 22, mono: true });
      d.text(420, 340, "padding puts y on the next line", { anchor: "middle", size: 14, fill: "#346538" });
    }
    if (frame === 3) d.text(80, 420, "Each write invalidates the other core's copy of this same line.", { size: 16, fill: "#9f2f2d" });
  },
  notes: [
    { h: "The unit the hardware actually moves", p: [
      "Caches keep small copies of memory close to a core so loads and stores do not cross the chip every time. The copy is not a single variable, because the hardware does not know what a variable is. It knows lines, usually 64 consecutive bytes aligned to 64.",
      "Coherence is the promise that those copies do not silently disagree. A common protocol (MESI and its relatives) lets one core hold a line in a writable state only if the other cores have dropped it. A write therefore invalidates other copies of that entire line.",
    ] },
    { h: "False versus true", p: [
      "True sharing: two cores really read and write the same variable, so the line should move. The program asked for communication. False sharing: the cores touch different variables that collided inside one line. The program asked for no communication, and the hardware communicates anyway.",
      "The symptom is a parallel loop that gets slower as you add cores, on data that looks perfectly partitioned. The counters stay correct. Only the timing is wrong. That is why it is a performance bug rather than a crash.",
    ] },
    { h: "How it gets into ordinary code", p: [
      "An array of counters, one per thread, packed tightly: `counters[threadId]++` inside a hot loop. Neighboring counters share a line, so neighboring threads fight. A struct of statistics with two threads updating two fields does the same thing.",
      "The usual fix is padding or alignment so that each hot variable starts on its own line. Some compilers offer an attribute or `alignas(64)`. You pad only the variables that are written from several cores. Padding everything wastes memory and can hurt for a different reason.",
    ] },
    { h: "Separating the exam's other phrases", p: [
      "Unallocated heap is a lifetime bug. Tools like AddressSanitizer hunt it. It is not a coherence effect. Re-entrant mutexes answer 'may I lock a mutex I already hold?' and their failure mode is deadlock or a logic error, not a bouncing line.",
      "A GC pause stops threads at a safe point so the collector can move objects. False sharing happens in C, in the middle of straight-line code, with no collector. If the option does not mention a cache line and independent data, it is a different chapter of systems.",
    ] },
  ],
});

window.LESSONS.push({
  id: 16,
  section: "Graphs and trees",
  nav: "Union-find, nearly flat",
  title: "Joining sets, then forgetting the long path",
  promise: "You will see a disjoint-set forest, watch path compression flatten a lookup, and meet the inverse Ackermann bound that is almost constant without being worst-case O(1).",
  question: "With path compression and rank union, DSU operations run in:",
  correct: 0,
  options: [
    { k: "A", t: "O(alpha(N)) amortized", why: "Union by rank keeps trees shallow, about log N at worst before compression. Path compression then makes every node on a lookup point straight at the root. Together, any sequence of M operations costs O(M α(N)), so each operation is O(α(N)) amortized. α grows so slowly it is at most 4 for any size you can store." },
    { k: "B", t: "O(log^2 N) worst case", why: "A squared logarithm is a bound you see on structures such as a 2D Fenwick tree or some heavy-light queries. It is not the union-find bound once both optimizations are present." },
    { k: "C", t: "O(sqrt(N)) amortized", why: "Square-root amortization belongs to other blocking tricks. A union-find with both improvements is far flatter than √N." },
    { k: "D", t: "O(1) worst case", why: "A single unlucky operation, before the paths are compressed, may still walk more than a constant number of links. The constant-looking behavior is an amortized statement about α(N), and α(N) is not defined as the constant 1. Calling it worst-case O(1) is the usual overstatement." },
  ],
  frames: [
    { h: "Each item starts alone", say: "Disjoint set union, also called union-find, keeps a partition of items. Two questions matter: are these two in the same set, and please join these two sets. Each set is a tree, stored by a parent pointer. The root is the name of the set." },
    { h: "Union by rank hangs the shorter tree", say: "If you always attach the left set under the right one, a line of unions builds a linked list, and a lookup walks N steps. Rank is a stand-in for height. Attach the smaller rank under the larger rank. The taller tree barely grows. A tree of rank k then has many nodes, and the height stays logarithmic." },
    { h: "Find walks to the root", say: "To ask which set 4 is in, follow parents until a node is its own parent. In a skinny tree that walk is the cost people are trying to kill. The answer is the root, and every node along the walk is in that same set." },
    { h: "Path compression rewires the walk", say: "Once you know the root, go back along the walk and point every node directly at that root. The next find on any of them is one step. You did extra writes today so that tomorrow is flat. That is path compression." },
    { h: "α, said without fear", say: "The inverse Ackermann function α(N) asks 'how many times can I apply a very fast-growing function before I pass N?' The answer grows slower than log, slower than log log, slower than any fixed tower of logs. For every N that fits in a machine, α(N) is at most 4. So the bound feels like a constant. Mathematically it is O(α(N)) amortized, not O(1) worst case." },
    { h: "Both optimizations are in the question", say: "The question requires path compression and union by rank together. Rank alone gives O(log N). Compression alone is already almost as good, but the clean famous bound uses both. Squared logs, square roots, and strict worst-case O(1) are other sentences." },
  ],
  paint(d, frame) {
    const flat = frame >= 3;
    const nodes = flat
      ? [
          { id: "1", label: "1", x: 420, y: 80, tone: "good" },
          { id: "2", label: "2", x: 180, y: 230 },
          { id: "3", label: "3", x: 340, y: 230 },
          { id: "4", label: "4", x: 500, y: 230, tone: "hot" },
          { id: "5", label: "5", x: 660, y: 230 },
        ]
      : [
          { id: "1", label: "1", x: 420, y: 70, tone: "good" },
          { id: "2", label: "2", x: 300, y: 180 },
          { id: "3", label: "3", x: 300, y: 300 },
          { id: "4", label: "4", x: 300, y: 420, tone: "hot" },
          { id: "5", label: "5", x: 560, y: 180 },
        ];
    const edges = flat
      ? [
          { a: "2", b: "1", directed: true },
          { a: "3", b: "1", directed: true },
          { a: "4", b: "1", directed: true, tone: "good" },
          { a: "5", b: "1", directed: true },
        ]
      : [
          { a: "2", b: "1", directed: true },
          { a: "3", b: "2", directed: true },
          { a: "4", b: "3", directed: true, tone: "warn" },
          { a: "5", b: "1", directed: true },
        ];
    d.graph(nodes, edges);
    d.text(40, 500, flat ? "After find(4): everyone on the path points at root 1." : "Before compression, find(4) walks 4 → 3 → 2 → 1.", { size: 16, fill: "#1f6c9f" });
  },
  notes: [
    { h: "The structure", p: [
      "You have N items and a collection of groups that never overlap. `find(x)` returns the representative of x's group. `union(x, y)` merges the two groups. If both finds return the same representative, x and y were already together.",
      "The cheap way to store it is a parent array. A root is an item whose parent is itself. find follows parents. union links one root under the other. That is the whole data structure. The rest is how you choose the link and how you tidy the path.",
    ] },
    { h: "Rank and compression", p: [
      "Union by rank: each root keeps a rank, starting at 0. When you merge, hang the smaller rank under the larger one. If the ranks are equal, pick either side and add one to the new root's rank. Rank is an upper bound on height. This alone makes find O(log N).",
      "Path compression: during find, after the root is known, set every visited node's parent to the root. There is a one-pass version that points each node at its grandparent on the way down, called path halving. The exam's phrase 'path compression' means the flattening. The next find is short because the first find paid for it.",
    ], code: "find(x):\n  if parent[x] != x:\n    parent[x] = find(parent[x])\n  return parent[x]" },
    { h: "How to hear α(N)", p: [
      "Ackermann's function grows by iterating the previous operation: after addition and multiplication and exponents, it keeps going. The inverse, α(N), therefore grows with ridiculous slowness. The theorem, due to Tarjan, is that with both optimizations a sequence of M finds and unions is O(M α(N)) time.",
      "Divide by M and each operation is O(α(N)) amortized. Amortized, because compression's cost is charged across the operations that benefit. For N far beyond the number of particles in the observable universe, α(N) is still a single digit. In code it behaves like a small constant. On a quiz, the precise option is O(α(N)) amortized.",
    ] },
    { h: "Why not the other three", p: [
      "Worst-case O(1) would mean every single call, even the one that walks a not-yet-compressed path, is bounded by a fixed constant. That is a stronger claim, and it is false for the standard structure. There are more elaborate union-find variants with different worst-case bounds. This question names the textbook pair of optimizations.",
      "O(log² N) is what you get from some tree-of-trees range structures. O(√N) is a block size, not a parent-pointer bound. If you see α, or the phrase 'almost O(1)', the careful answer is the inverse Ackermann one, and the word amortized has to be in it.",
    ] },
  ],
});

window.LESSONS.push({
  id: 17,
  section: "Algorithms and dynamic programming",
  nav: "Clear the lowest set bit",
  title: "What n & (n − 1) erases",
  promise: "You will watch the borrow ripple through the trailing zeros of n − 1, and see the AND leave every bit alone except the lowest 1.",
  question: "What does operation n & (n - 1) do to an integer?",
  correct: 0,
  interactive: "bits",
  options: [
    { k: "A", t: "Clears the lowest set bit", why: "Subtracting 1 flips every trailing 0 into 1 and flips the first 1 into 0. AND with the original keeps the higher bits, and kills that first 1, because 1 AND 0 is 0. The trailing zeros stay zero. Exactly one bit, the lowest set bit, turns off." },
    { k: "B", t: "Sets the highest unset bit", why: "This operation never turns a 0 into a 1. AND only removes bits. Setting a bit would be an OR, and the highest unset bit is a different place from the lowest set bit." },
    { k: "C", t: "Multiplies n by 2", why: "Multiplying by 2 is a left shift, `n << 1`, which slides every bit up and puts a zero at the bottom. AND with n−1 does not slide bits." },
    { k: "D", t: "Inverts all even bits", why: "Inverting a chosen set of bits is an XOR with a mask such as 010101… . AND does not invert. Bits that were 1 in the higher positions stay 1." },
  ],
  frames: [
    { h: "Twelve, written as bits", say: "Use 12. In binary it is 1100. The bits that are 1 are the 8 and the 4. The lowest set bit is the 4, the rightmost 1. The operation we are studying is 12 AND 11." },
    { h: "What subtracting 1 does", say: "Subtracting 1 borrows from the lowest 1. Every 0 to the right of that 1 flips to 1, and that 1 flips to 0. Bits above it do not change. 1100 minus 1 is 1011. Look at the rightmost 1: it became 0, and the two zeros behind it became ones." },
    { h: "AND keeps only the agreement", say: "AND writes a 1 only where both numbers have a 1. 1100 AND 1011: the top bit is 1 in both, so it stays. The next bit is 1 AND 0, so it dies. The last two bits are 0 AND 1, so they stay 0. Result 1000, which is 8. The lowest set bit is gone. Nothing else changed." },
    { h: "It never sets a bit", say: "Compare with the traps. Setting a bit would make a new 1 appear. Here a 1 disappeared. Multiplying by 2 would turn 1100 into 11000. Inverting even positions would flip bits rather than clear a single one. The result is a subset of the original bits." },
    { h: "Do it again, and the bits drain", say: "8 is 1000. 8 − 1 is 0111. AND is 0000. The only set bit was cleared, and the number became 0. That is a useful test: a positive n is a power of two exactly when `n & (n − 1)` is 0, because a power of two has only one set bit." },
    { h: "Where you will use it", say: "Loops that walk the set bits of a mask delete the lowest one each time: `for (int s = mask; s > 0; s = s & (s - 1))`. Each pass handles one bit, so the loop runs once per set bit, not once per bit position. The body of that trick is this operation." },
  ],
  paint(d, frame) {
    const scenes = [
      { n: "1100", m: "1011", r: "1000", hot: 2, title: "12 is 1100. Lowest 1 is bit 2." },
      { n: "1100", m: "1011", r: "1000", hot: 2, title: "12 - 1 borrows, and becomes 1011." },
      { n: "1100", m: "1011", r: "1000", hot: 2, title: "AND: only the 8-bit survives." },
      { n: "1100", m: "1011", r: "1000", hot: 2, title: "A bit was cleared, not set, shifted, or flipped." },
      { n: "1000", m: "0111", r: "0000", hot: 0, title: "8 & 7 = 0. One set bit means a power of two." },
      { n: "1100", m: "1011", r: "1000", hot: 2, title: "Repeat on the result to visit each set bit." },
    ];
    const scene = scenes[frame];
    d.bits(80, 80, 560, scene.n, frame >= 1 ? scene.hot : -1, "n");
    d.bits(80, 190, 560, scene.m, frame >= 1 ? scene.hot : -1, "n - 1");
    d.bits(80, 320, 560, scene.r, frame >= 2 ? scene.hot : -1, "n & (n - 1)");
    d.text(80, 450, scene.title, { size: 18, fill: "#1c1917" });
  },
  notes: [
    { h: "The borrow, slowly", p: [
      "Binary subtraction of 1 is a borrow that starts at the right. Trailing zeros cannot pay the borrow, so they become ones, and the borrow stops at the first one, which becomes zero. Everything to the left is copied. That is the entire arithmetic of `n - 1` when you care about bits.",
      "For 12, which is 1100, the two trailing zeros become ones and the 4's bit becomes zero: 1011, which is 11. For an odd number the lowest bit is already 1, so `n - 1` just turns that bit off and changes nothing else. 13 is 1101, 12 is 1100.",
    ] },
    { h: "Why the AND clears exactly that bit", p: [
      "Above the lowest 1, n and n−1 are identical, so AND keeps those bits. At the lowest 1, n has 1 and n−1 has 0, so AND writes 0. Below it, n has 0s, so AND writes 0 no matter what n−1 did. One bit changes, from 1 to 0.",
      "Try the box on this page with 12, then 13, then 8. 12 becomes 8. 13 becomes 12. 8 becomes 0. The typewriter version of the question is `n & (n - 1)`, and the English version is 'turn off the lowest set bit'.",
    ], code: "12 = 1100\n11 = 1011\nAND  1000     the 4-bit is gone" },
    { h: "The power-of-two test", p: [
      "A power of two has a single 1 in binary: 1, 2, 4, 8, 16. Clear that only bit and you get 0. Any other positive integer has another 1 somewhere, which survives. So `n > 0 && (n & (n - 1)) == 0` asks 'is n a power of two?'. Zero is excluded because 0 & (−1) is 0 in two's complement, and 0 is not a positive power of two.",
      "The same wipe is how you iterate subsets of a bitmask in some DP, and how Kernighan's bit count works: each iteration removes one set bit, so the number of iterations is the popcount.",
    ] },
    { h: "The operations this is not", p: [
      "`n | (n + 1)` sets the lowest unset bit. That is the nearest cousin, and it is an OR with a sum, not an AND with a difference. `n << 1` multiplies by 2. `n ^ mask` inverts the bits where the mask is 1. Option B, C, and D are those three different tools.",
      "Highest versus lowest is the other slip. The lowest set bit is the least significant 1, on the right in the usual writing. The highest is on the left. This borrow starts from the right, so it finds the lowest.",
    ] },
  ],
});

window.LESSONS.push({
  id: 18,
  section: "Graphs and trees",
  nav: "Dijkstra and negative edges",
  title: "The node we promised never to reopen",
  promise: "You will run Dijkstra on a three-node graph, watch it stamp a node as finished, and then see a negative edge offer a cheaper path that the stamp forbids it to take.",
  question: "Why does standard Dijkstra fail on negative edge weights?",
  correct: 0,
  options: [
    { k: "A", t: "Greedily marks nodes permanently optimal", why: "When Dijkstra pops a node, it treats that distance as final and never updates it again. That is safe only when every edge weight is non-negative, because a later path would have left the source through a heavier prefix. A negative edge can make a heavier-looking prefix win later." },
    { k: "B", t: "Causes infinite recursion on DAGs", why: "A DAG has no cycles, so nothing recurses forever. Dijkstra is usually written with a priority queue, not with unbounded recursion. Negative cycles, not DAGs, are what can make a shortest path undefined." },
    { k: "C", t: "Cannot compute in-degrees", why: "In-degrees are a count of arrows. Dijkstra never needs them. Kahn's algorithm does. Their absence is not the failure." },
    { k: "D", t: "Throws priority queue underflow", why: "A negative weight is still a number the queue can store. The algorithm does not underflow. It returns a confident, wrong distance." },
  ],
  frames: [
    { h: "The promise Dijkstra makes", say: "Dijkstra grows a set of settled nodes. When it takes the unsettled node with the smallest tentative distance, it declares that distance final. It will relax that node's outgoing edges, and it will never change that node again. The declaration is the greedy step." },
    { h: "A graph with one negative edge", say: "S→A costs 2. S→B costs 3. B→A costs −2. The best route to A is S to B to A, total 1. The direct route costs 2. There is no negative cycle. A shortest path exists. The weights are just not all friendly." },
    { h: "Settle S, then A looks best", say: "S is settled at 0. Relaxing gives A tentative 2 and B tentative 3. The smallest unsettled label is A, at 2. Dijkstra settles A forever. In its mind, 2 is the answer for A." },
    { h: "The negative edge arrives too late", say: "Next it settles B at 3, which really is B's best distance. Relaxing B→A offers 3 + (−2) = 1, which is better than 2. Standard Dijkstra refuses the offer, because A is already stamped. It reports 2. The truth is 1." },
    { h: "Why non-negative weights would have saved it", say: "If every edge were at least zero, any path that reaches A later would start with a prefix at least as heavy as the distance we already settled. It could not undercut A. The negative edge is exactly the permission to undercut a prefix that looked heavier at the time." },
    { h: "What to run instead", say: "If edges may be negative and there is no negative cycle, Bellman-Ford is correct, because it does not stamp a node early. If the graph is a DAG, one topological pass is correct even with negative edges. Dijkstra's failure is the permanent stamp, not a crash, not a missing in-degree, and not a DAG looping." },
  ],
  paint(d, frame) {
    const distA = frame >= 3 && frame < 4 ? "2 locked" : frame >= 4 ? "2 locked" : frame >= 2 ? "2" : "∞";
    const nodes = [
      { id: "S", label: "S", x: 160, y: 220, tone: "ink", sub: "0" },
      { id: "A", label: "A", x: 460, y: 80, tone: frame >= 2 ? "bad" : "idle", sub: distA },
      { id: "B", label: "B", x: 460, y: 340, tone: frame >= 3 ? "hot" : "idle", sub: frame >= 2 ? "3" : "∞" },
    ];
    d.graph(nodes, [
      { a: "S", b: "A", label: "2", tone: frame === 2 ? "bad" : "idle" },
      { a: "S", b: "B", label: "3" },
      { a: "B", b: "A", label: "-2", tone: frame >= 3 ? "good" : "warn", bend: 30 },
    ]);
    if (frame >= 3) d.card(600, 180, 250, 150, "Offer refused", ["3 + (-2) = 1", "better than 2", "A already final"], "bad");
    if (frame >= 4) d.text(40, 480, "Best path is S → B → A and costs 1. Dijkstra answered 2.", { size: 16, fill: "#9f2f2d" });
  },
  notes: [
    { h: "The algorithm in plain steps", p: [
      "Give the source distance 0 and everyone else infinity. Put them in a priority queue ordered by tentative distance. Pop the smallest. If you have already settled it, skip it. Otherwise settle it, and for each outgoing edge try to improve the neighbor. If a neighbor improves, put its new distance in the queue.",
      "The subtle line is 'settle'. After this pop, you will not accept a later improvement to this node. That is what makes the algorithm fast, and it is what makes the proof require non-negative weights.",
    ] },
    { h: "The proof, short enough to retell", p: [
      "Suppose every weight is ≥ 0, and A is the unsettled node with the smallest tentative distance. Any other path to A must enter the settled set through some edge into an unsettled node. That entrance cannot be cheaper than A's current label, because A was the smallest, and the rest of the path cannot be negative. So A's label is final.",
      "The sentence 'the rest of the path cannot be negative' is the whole assumption. One negative edge anywhere after a detour breaks it. In the picture, going to B first looks worse (3 instead of 2), and only the −2 redeems it.",
    ] },
    { h: "The numbers", p: [
      "After settling S: dist[A] = 2, dist[B] = 3. Pop A. Stamp dist[A] = 2. Pop B. The edge B→A proposes 1. A correct algorithm updates A to 1 and, if other nodes depended on A, continues. Standard Dijkstra has already moved on.",
      "Notice there is still a shortest path. The algorithm is not looping, and the queue is not broken. It simply returns the wrong number, which is worse than crashing, because the bug is quiet.",
    ] },
    { h: "The traps, and the repair", p: [
      "A DAG cannot cause infinite recursion; it has no cycle to recurse on. Dijkstra on a DAG with negative edges can still give the wrong answer for the same stamp reason, unless you replace it with the topological one-pass method. In-degrees are irrelevant. A priority queue happily stores −2.",
      "If you drop the 'stamp forever' rule and allow decrease-key to reopen nodes, negative edges without a negative cycle can be handled, but you have walked toward Bellman-Ford and you can loop forever if a negative cycle is reachable. The standard algorithm fails because of the permanent greedy mark.",
    ] },
  ],
});

window.LESSONS.push({
  id: 19,
  section: "Concurrency and the machine",
  nav: "Memory barriers",
  title: "A fence the CPU is not allowed to cross",
  promise: "You will see a writer store the data and then raise a flag, a reader trust the flag, and the reorder that makes the reader see the flag first. A barrier is the order that forbids that.",
  question: "What does a memory barrier (fence) guarantee?",
  correct: 0,
  options: [
    { k: "A", t: "Enforces CPU instruction execution order", why: "A barrier stops the processor and the compiler from moving memory operations across it. Operations before the fence become visible before operations after the fence. It is an ordering guarantee, which is exactly what a flag-and-data handshake needs." },
    { k: "B", t: "Deallocates heap memory instantly", why: "Freeing memory is the allocator's job, and 'instantly' is not even true of free. A fence does not know what a heap object is." },
    { k: "C", t: "Disables OS context switching", why: "A fence does not pin your thread to a core or turn off the scheduler. Another thread can still be switched in. The fence constrains memory order, not the dispatcher." },
    { k: "D", t: "Doubles call stack size", why: "Stack size is a linker or runtime setting. A fence does not allocate stack. Nothing about ordering changes how deep recursion may go." },
  ],
  frames: [
    { h: "The handshake", say: "Thread 1 prepares a message, then sets ready to true. Thread 2 waits until ready is true, then reads the message. In the source code the message is written first. Both authors intend that order to be the order of the world." },
    { h: "Why the machine reorders", say: "A store can sit in a buffer while later instructions run. A compiler can sink a write below another write if it cannot see a dependence. Cores can observe each other's stores out of the order they were issued. None of this is a bug until another thread is watching." },
    { h: "The broken order", say: "Thread 1's ready = true becomes visible before data = 42. Thread 2 sees the flag, leaves the loop, and reads data. It still sees the old 0. The flag lied, not because the programmer wrote it first, but because nothing forced the two stores to be observed in program order." },
    { h: "The fence", say: "Put a store barrier after the write to data and before the write to ready. The hardware must make the data store globally visible no later than the ready store. Thread 2, using a matching load barrier before it reads data, cannot observe the flag and then an older data value." },
    { h: "What is guaranteed, and what is not", say: "The guarantee is order: certain operations may not pass the fence. It is not a lock by itself, though locks contain fences. It does not free memory, does not freeze the scheduler, and does not grow the stack. Other threads keep running. They just cannot see a forbidden interleaving." },
    { h: "Where you already met one", say: "volatile in the double-checked locking lesson is a language-level way to ask for this order. A mutex unlock is a release fence, and a mutex lock is an acquire fence. The exam's plain question is the guarantee itself: enforce the order of memory operations around the fence." },
  ],
  paint(d, frame) {
    const fenced = frame >= 3;
    d.card(40, 36, 380, 230, "Thread 1  writer", fenced ? ["data = 42", "fence", "ready = true"] : ["ready = true", "data = 42", frame >= 2 ? "observed backwards" : "source order"], fenced ? "good" : frame >= 2 ? "bad" : "idle");
    d.card(460, 36, 380, 230, "Thread 2  reader", fenced ? ["wait until ready", "fence", "read data = 42"] : ["sees ready", frame >= 2 ? "reads data = 0" : "then reads data", ""], frame >= 2 && !fenced ? "bad" : fenced ? "good" : "idle");
    if (fenced) {
      d.rect(40, 300, 800, 16, { tone: "ink", rx: 2 });
      d.text(440, 360, "operations above the fence stay above it", { anchor: "middle", size: 16, fill: "#1c1917" });
    } else if (frame >= 2) {
      d.text(40, 340, "ready is visible. data is not. The reader runs too early.", { size: 18, fill: "#9f2f2d" });
    }
  },
  notes: [
    { h: "The problem the fence exists for", p: [
      "Inside one thread, the CPU keeps the illusion that instructions ran in program order. Across threads, that illusion is not free, so hardware does not always provide it. A write can be buffered. A later write can be seen first by another core. Compilers do the same class of thing when they reorder independent stores.",
      "The flag pattern is the smallest victim. `data = 42; ready = true;` on one side and `while (!ready) {} print(data);` on the other. If `ready` is observed first, the print can show 0. Both sides followed their source. The shared memory did not honor the order.",
    ] },
    { h: "What you are allowed to assume after a fence", p: [
      "A full memory barrier says: every memory operation issued before the fence is complete, from the point of view of the ordering rules, before any memory operation issued after the fence. Acquire and release are one-way versions of this. Release stops earlier writes from drifting down past the flag. Acquire stops later reads from drifting up above the flag.",
      "You need a matching pair. A writer-side fence does not help a reader that is allowed to speculate its load of `data` before its load of `ready`. The language or the barrier has to constrain both ends. This is why a single naked store, marked ordinary, is not a publication mechanism.",
    ] },
    { h: "It is an ordering tool, not a magic lock", p: [
      "A fence does not make a read-modify-write atomic. Two threads can still both increment a counter and lose an update, if the increment itself is not atomic. The fence would only arrange when the surrounding loads and stores are observed. Atomicity and ordering are neighbors, and they are not the same switch.",
      "Nor does a fence stop the operating system. Your thread can be preempted immediately after the fence. The other core keeps running. Context switches are option C's topic, and they are not what a fence disables.",
    ] },
    { h: "How this sits next to the earlier lessons", p: [
      "Double-checked locking failed because the store of the pointer could be observed before the constructor stores. A barrier, or volatile, which inserts the right barriers, puts the constructor on the early side and the pointer on the late side. Lesson 3 was this lesson wearing a constructor.",
      "Freeing memory, growing a stack, and pausing the scheduler do not appear in that story. If an option is about allocation or the dispatcher, it has left the coherence-and-ordering chapter.",
    ] },
  ],
});

window.LESSONS.push({
  id: 20,
  section: "Algorithms and dynamic programming",
  nav: "The extra log in the tree",
  title: "When every level of the tree costs a little less",
  promise: "You will add the cost of a recursion tree level by level for T(N) = 2T(N/2) + N log N, and see the total land on N log² N rather than the merge-sort bound.",
  question: "For recurrence T(N) = 2T(N/2) + N log N, what is T(N)?",
  correct: 0,
  options: [
    { k: "A", t: "Theta(N * log^2 N)", why: "The root costs N log N. The next level costs about N (log N − 1). Each of the log N levels contributes about N times a shrinking log. The sum of the first log N integers, times N, is Theta(N log² N)." },
    { k: "B", t: "Theta(N * log N)", why: "That is the merge-sort bound, where every level costs N and there are log N levels. Here a level does not cost N. The root alone costs N log N, and the levels below are the same shape. One log is not enough." },
    { k: "C", t: "Theta(N^2)", why: "Quadratic recurrences show up when the combine step is N², or when the tree branches badly, as in the naive recursive Fibonacci story's exponential cousin. The work here, added up, is a little above N log N and far below N²." },
    { k: "D", t: "Theta(N)", why: "Linear would require the non-recursive work to shrink geometrically, the way T(N) = 2T(N/2) + N / log N can, or a single pass with no branching. This tree does about N log N work at the top and keeps going." },
  ],
  frames: [
    { h: "Read the recurrence as a tree", say: "T(N) is the time for a problem of size N. The equation says: solve two halves, then spend N log N extra at this size. Draw one box for the root, labeled with that extra cost. It has two children of size N/2, and they have children, until the size is 1." },
    { h: "Use N = 8 so the numbers fit", say: "Let log mean log base 2, and let N be 8. log 8 is 3. The root's extra cost is 8 · 3 = 24. Each child has size 4, and log 4 is 2, so each child costs 4 · 2 = 8. Two children cost 16. The next level is four problems of size 2, each costing 2 · 1 = 2, total 8. The leaves cost a constant." },
    { h: "Add a column", say: "Level costs: 24, then 16, then 8, then a handful for the leaves. That is 24 + 16 + 8 = 48, plus 8 leaves. Notice each level is N times something: 8·3, 8·2, 8·1. The something is a countdown of the log." },
    { h: "The countdown sums to a square", say: "3 + 2 + 1 = 6, and 6 is 3·4/2, the triangular number. In general the level costs add up to N · (log N) · (log N + 1) / 2. Drop the constants the way Theta asks, and you have Theta(N log² N). For N = 8, N log N is 24 and N log² N is 72. Our 48 sits with the square, not with the single log." },
    { h: "Why it is not merge sort", say: "Merge sort is T(N) = 2T(N/2) + N. Every level sums to exactly N, and there are log N levels, so N log N. The only change in this question is that the combine step is heavier by a log. That extra log rides along into the total and becomes the second log." },
    { h: "The master theorem, after you have seen it", say: "Here a = 2, b = 2, so N^(log_b a) is N¹. The combine cost is N log N, which is N times a log. The extended master theorem says: if the combine cost is N · logᵏ N, the solution picks up one more log, giving N · logᵏ⁺¹ N. With k = 1, that is N log² N. The tree is the reason the theorem says that." },
  ],
  paint(d, frame) {
    const costs = [
      { x: 390, y: 30, w: 100, t: "24", sub: "n=8" },
      { x: 230, y: 130, w: 90, t: "8", sub: "n=4" },
      { x: 560, y: 130, w: 90, t: "8", sub: "n=4" },
      { x: 80, y: 240, w: 80, t: "2", sub: "n=2" },
      { x: 200, y: 240, w: 80, t: "2", sub: "n=2" },
      { x: 520, y: 240, w: 80, t: "2", sub: "n=2" },
      { x: 680, y: 240, w: 80, t: "2", sub: "n=2" },
    ];
    const show = frame === 0 ? 1 : frame === 1 ? 3 : 7;
    costs.slice(0, show).forEach((box, index) => {
      const tone = index === 0 ? "hot" : "idle";
      d.rect(box.x, box.y, box.w, 58, { tone, rx: 8 });
      d.text(box.x + box.w / 2, box.y + 22, box.t, { anchor: "middle", size: 18, mono: true });
      d.text(box.x + box.w / 2, box.y + 44, box.sub, { anchor: "middle", size: 12, fill: "#787774" });
    });
    if (frame >= 2) {
      const rows = [["level 0", "8 · 3 = 24"], ["level 1", "8 · 2 = 16"], ["level 2", "8 · 1 = 8"]];
      rows.forEach((row, i) => {
        d.text(80, 360 + i * 28, row[0], { size: 15, fill: "#787774" });
        d.text(220, 360 + i * 28, row[1], { size: 16, mono: true });
      });
    }
    if (frame >= 3) d.text(460, 390, "24+16+8 = 48 = Θ(n log² n)", { size: 16, fill: "#346538" });
  },
  notes: [
    { h: "What the equation is saying", p: [
      "A recurrence is a bill for a recursive function. `2T(N/2)` is the bill of the two recursive calls on half the input. `N log N` is the bill of the work you do besides those calls: partitioning, merging, or building a table at this level. Theta means we care about the growth, not the constant in front.",
      "Assume N is a power of two so the halves are clean, and write log for log base 2. Those assumptions do not change the Theta class. Also assume T(1) is a constant. The leaves will not be the interesting part.",
    ] },
    { h: "The level costs", p: [
      "At level i, counting from 0 at the root, there are 2ⁱ subproblems, each of size N / 2ⁱ. One of them costs (N / 2ⁱ) · log(N / 2ⁱ) = (N / 2ⁱ) · (log N − i). Multiply by how many there are: the 2ⁱ cancels, and the level costs N · (log N − i).",
      "i runs from 0 until log N. The costs are N log N, then N (log N − 1), then N (log N − 2), and so on down to N · 1. Factor out N. You are adding the integers from 1 through log N.",
    ], code: "level i costs  N · (log N - i)\nsum            N · (1 + 2 + ... + log N)\n             = N · log N · (log N + 1) / 2\n             = Θ(N log² N)" },
    { h: "Check it on N = 8", p: [
      "Root 8·3 = 24. Next level 2·(4·2) = 16. Next 4·(2·1) = 8. Leaves 8·T(1), a constant, say 8. Total around 56. N log N = 24, which is only the root: too small to be the whole tree. N² = 64, close at this tiny N and then left behind, because the real formula grows like N · 9 when log N is 3, and like N · 100 when log N is 10, while N² would be N · N.",
      "Option B is what you get if you replace the combine cost by N. Do not carry merge sort's answer over unchanged when the equation changed.",
    ] },
    { h: "The master theorem as a shortcut", p: [
      "The master theorem compares the combine cost f(N) with N^(log_b a). In this equation a = 2 and b = 2, so that critical curve is N. f(N) = N log N is larger than N by a log factor. When f(N) = Theta(N logᵏ N) for k ≥ 0, the solution is Theta(N logᵏ⁺¹ N). Here k is 1, so one more log gives Theta(N log² N).",
      "If you forget the extended case and force the plain case 2, you will answer N log N, which is option B, and you will be describing f(N) = Theta(N). Look at the combine term before you pick the case. The tree sum is there whenever the theorem feels like a spell.",
    ] },
  ],
});
