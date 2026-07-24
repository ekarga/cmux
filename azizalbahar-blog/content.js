window.ARTICLES = [
  {
    slug: "the-last-ten-percent",
    title: "The last 10% of a native app is the whole product.",
    category: "Craft",
    date: "2026-07-18",
    displayDate: "Jul 18, 2026",
    readTime: "6 min",
    excerpt:
      "People remember whether an app felt calm, fast, and trustworthy—not how many tickets it closed. A field guide to the details that turn working software into a coherent product.",
    keywords: ["native apps", "polish", "iOS", "macOS", "product craft", "animation", "latency"],
    body: `
      <p>There is a moment near the end of every app project when the room gets a little impatient. The main flows work. The data arrives. The crashes have been chased into corners. Someone looks at the remaining list—an animation that lands half a beat late, a button that shifts when its label changes, a sheet that forgets where you left it—and says: “This is the last ten percent.”</p>

      <p>They usually mean the disposable part. The polish. The work we can cut if the calendar starts winning.</p>

      <p>I have started to think the opposite is true. That last ten percent is the only part most people ever experience as <em>the product</em>.</p>

      <h2 id="people-dont-see-architecture">People don’t see the architecture</h2>

      <p>A person opening your app does not see your careful dependency graph. They cannot admire the cache policy that took three attempts to get right. They do not know that a migration ran flawlessly before the first frame appeared. All of that matters—it creates the conditions for a good experience—but it stays backstage.</p>

      <p>What they do see is whether the screen moves when they touch it. Whether the back button returns them to the place they expected. Whether the app remembers the small choice they made yesterday. Whether an error sounds like a human wrote it.</p>

      <blockquote>
        Quality is not a layer placed on top of engineering. It is the shape engineering takes when it reaches a person.
      </blockquote>

      <p>This is especially visible in native software. The platform has already taught people a language: momentum, selection, focus, sheets, menus, keyboard commands, undo. When an app speaks that language fluently, nobody stops to congratulate it. They simply keep moving. When it gets the grammar wrong, every sentence feels expensive.</p>

      <h2 id="speed-is-emotional">Speed is emotional</h2>

      <p>We tend to discuss performance as a number. Launch time. Frame time. Payload size. Those numbers are essential, but the feeling of speed is more complicated than any one measurement.</p>

      <p>An app can finish a request quickly and still feel slow if it leaves the interface frozen while it waits. It can take longer and feel responsive if it acknowledges intent immediately, preserves context, and makes progress legible. The difference is not deception. It is respect.</p>

      <p>Good latency design answers three questions without making the person ask:</p>

      <ol>
        <li>Did the app hear me?</li>
        <li>Is something happening?</li>
        <li>Can I keep going?</li>
      </ol>

      <p>A pressed state answers the first. A transition or a carefully chosen placeholder answers the second. Optimistic updates, cancellation, and work that stays off the main thread can answer the third. These details live across design and implementation. No one discipline gets to own them.</p>

      <div class="aside-note">
        <strong>A useful review</strong>
        Record a normal task with “Reduce Motion” enabled and the network slowed down. Watch it once with sound off. Every unexplained pause and every jump in layout will become obvious.
      </div>

      <h2 id="continuity-over-spectacle">Continuity over spectacle</h2>

      <p>The best animation in an app is rarely the most impressive one. It is the one that explains where something went.</p>

      <p>A row expands into a detail view. A dragged object settles where it was dropped. A toolbar makes room instead of teleporting. These movements preserve continuity: the quiet sense that the interface is one place rather than a stack of unrelated screenshots.</p>

      <p>That is why a technically smooth animation can still feel wrong. If it starts from the wrong geometry, ignores the person’s gesture, or lands without carrying their focus forward, sixty frames per second only renders the confusion more precisely.</p>

      <p>I like to test transitions with a crude question: if I replaced the animation with a flipbook, would each frame explain the next? If not, the motion is decoration. If yes, it is part of the information architecture.</p>

      <h2 id="remember-the-person">Remember the person</h2>

      <p>Some of the highest-leverage polish is not visual at all. It is memory.</p>

      <p>Remember the sidebar width. Restore the draft. Keep the selected tab selected. Put focus back where it was after dismissing a sheet. Preserve the scroll position when someone briefly follows a link and returns. If a setting changes the way a workspace behaves, make that setting available everywhere the behavior can be invoked.</p>

      <p>None of these features demos especially well. Together, they create the impression that the app is paying attention.</p>

      <p>Trust is built from that impression. So is the opposite. A single forgotten draft can outweigh a dozen beautiful icons because the app has revealed what it values. It values its own state more than yours.</p>

      <h2 id="define-done-differently">Define done differently</h2>

      <p>The last ten percent becomes endangered when it exists only as taste in somebody’s head. The fix is not to argue harder for polish at the end. It is to make quality concrete from the beginning.</p>

      <p>For any important flow, “done” can include more than the happy path:</p>

      <ul>
        <li>It works with a keyboard and with assistive technology.</li>
        <li>It behaves sensibly with slow data, no data, and too much data.</li>
        <li>It preserves the person’s context across navigation and relaunch.</li>
        <li>It explains failure and offers a next step.</li>
        <li>It matches the platform until there is a good reason not to.</li>
        <li>It still feels coherent when motion is reduced and text is enlarged.</li>
      </ul>

      <p>This list is not glamorous. That is useful. Craft becomes repeatable when it stops depending on a heroic final week.</p>

      <h2 id="the-part-people-take-home">The part people take home</h2>

      <p>There will always be a tension between shipping and refining. An app can be polished forever and useful never. Constraints are real; taste includes knowing what to leave alone.</p>

      <p>But I no longer think of the final details as extras. They are compression. Hundreds of technical and design choices compressed into one feeling: this tool is ready for me.</p>

      <p>People may never know which decisions produced that feeling. They do not need to. The product is what remains after the implementation disappears.</p>
    `,
  },
  {
    slug: "a-mental-model-for-swift-tasks",
    title: "A useful mental model for Swift Tasks",
    category: "Swift",
    date: "2026-06-29",
    displayDate: "Jun 29, 2026",
    readTime: "5 min",
    excerpt:
      "A Task is not a magical background thread. Thinking in terms of inherited context, lifetime, and ownership makes concurrency code much easier to reason about.",
    keywords: ["Swift", "concurrency", "Task", "async await", "ownership", "actors"],
    body: `
      <p>Swift’s <code>Task</code> type looks small enough to understand at a glance. Put asynchronous work in the closure, await a value, and move on. The trouble begins when we use that small syntax to hide three different questions: where the work runs, how long it lives, and who is responsible for stopping it.</p>

      <p>The mental model I find most useful is this: a task is a piece of work with a context, a lifetime, and an owner—even when the owner is “nobody.”</p>

      <h2 id="context-is-inherited">Context is inherited</h2>

      <p>An unstructured <code>Task { ... }</code> inherits important context from the point where it is created, including actor isolation and task-local values. That means a task created from a main-actor-isolated method can begin main-actor-isolated too. “I wrapped it in a Task” is not the same thing as “I moved it off the main thread.”</p>

      <p>This is a feature. Inheritance lets asynchronous work continue with the same safety guarantees as its caller. It only becomes surprising when the code uses <code>Task</code> as a visual synonym for “background.”</p>

      <pre><code>@MainActor
func refresh() {
    refreshTask = Task {
        let snapshot = try await repository.fetchSnapshot()
        guard !Task.isCancelled else { return }
        model = snapshot
    }
}</code></pre>

      <p>In this example, updating <code>model</code> is naturally safe. The repository can perform network or database work without blocking the actor while it is suspended. There is no need to scatter manual hops back to the main queue.</p>

      <h2 id="lifetime-should-match-purpose">Lifetime should match purpose</h2>

      <p>A task launched by a view often should not outlive the view. A task launched to persist a user’s explicit action may need to. The syntax can look nearly identical, but the correct lifetime is different.</p>

      <p>That leads to a practical question before creating any task: <em>what event makes this work irrelevant?</em> A new search query? Closing a window? Signing out? The answer usually points to where the task handle should live and when cancellation should happen.</p>

      <blockquote>Cancellation is not a punishment delivered to a task. It is information: the result is no longer wanted.</blockquote>

      <p>Swift cancellation is cooperative. Checking it at meaningful boundaries is part of designing the operation, not cleanup to add later. Work that loops, transforms large values, or crosses APIs that do not automatically react to cancellation needs explicit checks.</p>

      <h2 id="ownership-makes-behavior-legible">Ownership makes behavior legible</h2>

      <p>Saving a task handle is not only about calling <code>cancel()</code>. It documents which object owns the operation. When new work supersedes old work, the mutation path becomes obvious:</p>

      <pre><code>searchTask?.cancel()
searchTask = Task { [query] in
    let results = try await searchIndex.results(for: query)
    try Task.checkCancellation()
    self.results = results
}</code></pre>

      <p>Detached tasks have a place, but they deliberately give up inherited priority, actor context, and task-local values. That makes them a sharp tool, not a more powerful default.</p>

      <h2 id="three-questions">Three questions</h2>

      <p>When concurrency code feels mysterious, I write down three answers:</p>

      <ol>
        <li>Which isolation context does this operation begin in?</li>
        <li>What should cause it to end or become irrelevant?</li>
        <li>Which object owns that decision?</li>
      </ol>

      <p>Once those answers are visible, <code>Task</code> becomes much less magical. It becomes what we wanted all along: a clear boundary around asynchronous work.</p>
    `,
  },
  {
    slug: "what-good-developer-tools-leave-out",
    title: "What the best developer tools leave out",
    category: "Tools",
    date: "2026-06-05",
    displayDate: "Jun 5, 2026",
    readTime: "4 min",
    excerpt:
      "Power does not come from having every feature in reach. It comes from preserving the user’s train of thought while the tool quietly handles the rest.",
    keywords: ["developer tools", "tool design", "focus", "workflows", "product"],
    body: `
      <p>Developer tools are unusually vulnerable to visible cleverness. Their users appreciate capability, so every new control can be defended as power. Soon the interface becomes a museum of everything the tool knows how to do.</p>

      <p>The developer tools I return to are often defined by what they decline to show me.</p>

      <h2 id="tools-are-between-thoughts">Tools live between thoughts</h2>

      <p>A text editor, terminal, debugger, or API client rarely owns the whole job. It sits between an intention and a result. The tool is successful when that intention survives the trip.</p>

      <p>This changes the product question. Instead of “How quickly can a user find every command?” we can ask “How little context must they exchange to complete the next move?” Keyboard shortcuts help. So do stable layouts, useful defaults, and commands that appear in the context where they matter.</p>

      <p>A palette can contain a thousand actions without making the screen feel crowded. A contextual menu can expose a rare command without asking everyone to look at it all day. Power and visual density are separate choices.</p>

      <h2 id="composability-over-prediction">Composability over prediction</h2>

      <p>Tools become enduring when they supply strong primitives and let people combine them. The alternative is to predict complete workflows. Prediction looks impressive in a demo but becomes brittle in real work, where every repository, team, and brain has its own shape.</p>

      <blockquote>The best primitive is specific enough to be useful and open enough to be surprising.</blockquote>

      <p>A pane, a command, a URL, a stream of text: none is a finished workflow. Together, they let a person build one the product team never imagined. That is not a failure of product vision. It is leverage.</p>

      <h2 id="quiet-is-a-feature">Quiet is a feature</h2>

      <p>Attention is the scarce resource in serious tools. Notifications should carry meaning. Animation should preserve context. Status should be available without demanding to be watched. If everything asks to be noticed, the tool turns work into supervision.</p>

      <p>The most respectful developer tools feel almost plain at rest. Their complexity is folded, not removed. It opens at the moment of need and closes when the thought can continue.</p>
    `,
  },
  {
    slug: "the-moment-after-the-click",
    title: "Designing for the moment after the click",
    category: "Product",
    date: "2026-05-14",
    displayDate: "May 14, 2026",
    readTime: "3 min",
    excerpt:
      "A control’s real design is not its resting appearance. It is the chain of feedback, progress, success, and recovery that begins when someone uses it.",
    keywords: ["product design", "feedback", "interaction", "loading states", "errors"],
    body: `
      <p>Interface reviews naturally gather around screenshots. Screenshots are easy to compare and easy to comment on. But a button’s most important state does not exist until the screenshot ends.</p>

      <p>The moment after the click is where the interface proves whether it understands the action.</p>

      <h2 id="acknowledge-intent">Acknowledge intent</h2>

      <p>The first response should be immediate and proportional. A control depresses. A menu closes. A row adopts a pending state. The interface says “I heard you” before the underlying work has time to finish.</p>

      <p>Without that acknowledgement, people repeat actions. Duplicate requests appear. Uncertainty becomes a data problem.</p>

      <h2 id="show-the-right-progress">Show the right progress</h2>

      <p>Not every delay deserves a spinner. Very short work often needs only an immediate state change. Work with an understandable sequence may benefit from showing the current step. Indeterminate progress is useful when it is honest, but a motion that loops forever can feel like the product is asking for faith.</p>

      <p>Whenever possible, preserve the surface around the action. Replacing an entire screen with a loading view throws away context the app will have to rebuild a moment later.</p>

      <h2 id="make-failure-actionable">Make failure actionable</h2>

      <p>“Something went wrong” describes the product’s feeling, not the person’s options. A useful failure state says what was preserved, what was not, and what can happen next.</p>

      <blockquote>The click is the beginning of a promise. Every state that follows either keeps it or renegotiates it clearly.</blockquote>

      <p>Designing that full chain takes more effort than styling the control. It also prevents entire categories of accidental complexity. The moment after the click is not edge-case territory. It is the interface.</p>
    `,
  },
  {
    slug: "the-backend-is-part-of-the-interface",
    title: "The backend is part of the interface",
    category: "Systems",
    date: "2026-04-21",
    displayDate: "Apr 21, 2026",
    readTime: "5 min",
    excerpt:
      "Retries, ordering, stale data, and idempotency eventually become pixels. Product quality depends on treating distributed-systems behavior as interaction design.",
    keywords: ["backend", "API design", "distributed systems", "optimistic UI", "retries"],
    body: `
      <p>The boundary between frontend and backend is useful for organizing code and unreliable for explaining a product. A person does not experience two systems. They experience whether their action worked.</p>

      <p>Every backend decision eventually develops a visual form. Ordering becomes a list that jumps. Retry policy becomes a button that appears broken. Cache invalidation becomes yesterday’s status sitting beside today’s action.</p>

      <h2 id="apis-create-interaction-constraints">APIs create interaction constraints</h2>

      <p>An API that returns only a final result forces the interface to wait or invent progress. An API that exposes stable identifiers lets the client reconcile optimistic state. An idempotent mutation lets a retry feel safe instead of dangerous.</p>

      <p>These are not just backend niceties. They determine which experiences the client can honestly offer.</p>

      <h2 id="optimism-needs-a-plan">Optimism needs a plan</h2>

      <p>Optimistic UI is often described as updating first and apologizing if the request fails. A robust optimistic mutation is more disciplined:</p>

      <ol>
        <li>Record the previous authoritative state.</li>
        <li>Associate the pending change with a request identity.</li>
        <li>Render the intended result immediately.</li>
        <li>Reconcile with the server response.</li>
        <li>Roll back or explain conflict when the result differs.</li>
      </ol>

      <p>Without identity and reconciliation, two quick actions can resolve out of order and make the screen lie. The animation may be smooth while the state becomes nonsense.</p>

      <h2 id="errors-cross-the-boundary">Errors cross the boundary</h2>

      <p>A typed error model is interface infrastructure. “Unauthorized,” “temporarily unavailable,” and “the object changed since you loaded it” need different recovery paths. Flattening them into one server error pushes guesswork into the UI—or worse, into the person using it.</p>

      <div class="aside-note">
        <strong>Design prompt</strong>
        For every mutation, write the user-visible behavior for timeout, duplicate submission, stale input, partial success, and a response arriving after the view has gone away.
      </div>

      <h2 id="one-product">One product</h2>

      <p>Frontend engineers benefit from understanding delivery semantics. Backend engineers benefit from watching the interface during slow and failed requests. The best contract is not merely easy to call. It makes the desired product behavior possible.</p>

      <p>The backend is part of the interface because time, truth, and failure are part of the interface. The pixels are simply where those decisions become visible.</p>
    `,
  },
  {
    slug: "notes-from-shipping-small-apps",
    title: "Notes from shipping small apps",
    category: "Product",
    date: "2026-03-30",
    displayDate: "Mar 30, 2026",
    readTime: "4 min",
    excerpt:
      "Small apps expose product judgment. With nowhere for complexity to hide, every feature has to earn its place and every rough edge becomes part of the idea.",
    keywords: ["indie apps", "shipping", "scope", "product", "App Store"],
    body: `
      <p>A small app is not a large app waiting to grow up. It has a different advantage: the whole idea can fit in one person’s head at once.</p>

      <p>That makes small projects unusually good teachers. There is nowhere for a vague premise to hide. If the app cannot explain itself in a sentence, another settings screen will not save it.</p>

      <h2 id="choose-a-complete-loop">Choose a complete loop</h2>

      <p>The most useful unit of scope is not a feature. It is a complete loop: intent, action, result, and a reason to return. One finished loop teaches more than five half-built destinations in a tab bar.</p>

      <p>When deciding what belongs in a first version, I ask whether a feature makes the central loop possible, more reliable, or meaningfully better. “People might expect it” is not yet an answer.</p>

      <h2 id="defaults-are-product-decisions">Defaults are product decisions</h2>

      <p>A small app cannot begin with an interview. Every required choice spends momentum. Good defaults turn experience and opinion into a head start, while leaving an exit for people who know they want something else.</p>

      <p>This is one reason native conventions are so valuable. They provide a large set of shared defaults for free: where preferences live, how selection behaves, what a destructive action looks like, which gestures can be trusted.</p>

      <h2 id="distribution-changes-the-product">Distribution changes the product</h2>

      <p>Submitting an app reveals work the prototype never mentioned: privacy text, screenshots, onboarding, support, migration, pricing, and what happens when the network is gone. These are not chores around the product. For someone discovering the app, they <em>are</em> the product.</p>

      <blockquote>Shipping is the act of letting reality edit the idea.</blockquote>

      <h2 id="leave-space">Leave space</h2>

      <p>A small app feels confident when it is willing to remain small. It can perform one job, keep its interface quiet, and let the rest of the device continue to exist.</p>

      <p>That restraint is not lack of ambition. It is a bet that clarity compounds—that a person will return to the tool that asks the least and finishes the thought.</p>
    `,
  },
];
