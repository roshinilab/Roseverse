const $ = id => document.getElementById(id);

const get = key => {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? [];
    } catch {
        return [];
    }
};

let sessions = get("rv_sessions");
let tasks = get("rv_tasks");
let events = get("rv_events");

let seconds = 0;
let timer = null;
let running = false;

function save() {
    localStorage.setItem("rv_sessions", JSON.stringify(sessions));
    localStorage.setItem("rv_tasks", JSON.stringify(tasks));
    localStorage.setItem("rv_events", JSON.stringify(events));
}

function today() {
    const d = new Date();
    return [
        d.getFullYear(),
        String(d.getMonth()+1).padStart(2,"0"),
        String(d.getDate()).padStart(2,"0")
    ].join("-");
}

$("today").textContent = new Date().toDateString();

function dashboard() {
    const total = sessions.reduce((a,b)=>a+b.seconds,0);

    $("hours").textContent =
        Math.floor(total/3600)+"h "+
        Math.floor(total%3600/60)+"m";

    $("done").textContent = tasks.filter(t=>t.done).length;

    $("progress").textContent =
        Math.min(100,Math.round(total/21600*100))+"%";

    let days = [...new Set(sessions.map(s=>s.date))].sort().reverse();
    let streak = 0;
    let d = new Date();

    while(days.includes(formatDate(d))) {
        streak++;
        d.setDate(d.getDate()-1);
    }

    $("streak").textContent = streak+" Days";

    $("badges").textContent = [
        tasks.filter(t=>t.done).length >= 1 ? "🌱 First Task Completed" : "",
        tasks.filter(t=>t.done).length >= 10 ? "🌷 10 Tasks Completed" : "",
        streak >= 3 ? "🔥 Three Day Streak" : "",
        total >= 36000 ? "🏆 Ten Hours Studied" : ""
    ].filter(Boolean).join("  •  ") || "Your achievements will appear here.";
}

function formatDate(d) {
    return [
        d.getFullYear(),
        String(d.getMonth()+1).padStart(2,"0"),
        String(d.getDate()).padStart(2,"0")
    ].join("-");
}

function displayTimer() {
    let h = String(Math.floor(seconds/3600)).padStart(2,"0");
    let m = String(Math.floor(seconds%3600/60)).padStart(2,"0");
    let s = String(seconds%60).padStart(2,"0");

    $("clock").textContent = `${h}:${m}:${s}`;
}

$("start").onclick = () => {
    if(running) return;
    running = true;

    timer = setInterval(()=>{
        seconds++;
        displayTimer();
    },1000);
};

$("pause").onclick = () => {
    clearInterval(timer);
    running = false;
};

$("save").onclick = () => {
    if(seconds === 0) return alert("Study for a little while first!");

    sessions.push({
        subject: $("subject").value.trim() || "General Study",
        seconds,
        date: today()
    });

    clearInterval(timer);
    running = false;
    seconds = 0;
    displayTimer();

    save();
    dashboard();
    updateChart();

    showPopup("🌷 Beautiful work! Your study session has been saved.");
};

$("reset").onclick = () => {
    clearInterval(timer);
    running = false;
    seconds = 0;
    displayTimer();
};

function renderTasks() {
    $("taskList").innerHTML = "";

    tasks.forEach((t,i)=>{
        const div = document.createElement("div");
        div.className = "task"+(t.done?" done":"");

        const title = document.createElement("strong");
        title.textContent = t.title+" — "+t.priority+" Priority";

        const date = document.createElement("p");
        date.textContent = "Deadline: "+(t.deadline || "Not set");

        const finish = document.createElement("button");
        finish.textContent = t.done ? "Completed ✓" : "Finish Task";

        finish.onclick = () => {
            if(t.done) return;

            const note = prompt("What did you learn from this task?");
            t.note = note || "";
            t.done = true;

            save();
            renderTasks();
            dashboard();

            showPopup("🎁 Task completed! Every small step brings you closer to your dreams.");
        };

        const remove = document.createElement("button");
        remove.textContent = "Delete";

        remove.onclick = () => {
            tasks.splice(i,1);
            save();
            renderTasks();
            dashboard();
        };

        div.append(title,date,finish,remove);
        $("taskList").appendChild(div);
    });
}

$("addTask").onclick = () => {
    const title = $("taskName").value.trim();

    if(!title) return alert("Enter a task name!");

    tasks.push({
        title,
        deadline:$("deadline").value,
        priority:$("priority").value,
        done:false,
        note:""
    });

    $("taskName").value = "";

    save();
    renderTasks();
    dashboard();
};

function renderEvents() {
    $("eventList").innerHTML = "";

    events.forEach((e,i)=>{
        const div = document.createElement("div");
        div.className = "task";

        const label = document.createElement("p");
        label.textContent = "📅 "+e.title+" — "+e.date+" "+(e.time || "");

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.onclick = () => {
            events.splice(i,1);
            save();
            renderEvents();
        };

        div.append(label,del);
        $("eventList").appendChild(div);
    });
}

$("addEvent").onclick = () => {
    const title = $("eventName").value.trim();
    const date = $("eventDate").value;

    if(!title || !date) return alert("Enter event and date!");

    events.push({
        title,
        date,
        time:$("eventTime").value
    });

    $("eventName").value = "";
    save();
    renderEvents();
};

$("saveJournal").onclick = () => {
    localStorage.setItem("rv_journal",$("journal").value);
    showPopup("📝 Your thoughts have been saved!");
};

$("journal").value = localStorage.getItem("rv_journal") || "";

const quotes = [
    "You are growing, even when you cannot see it. 🌷",
    "Small steps every day create beautiful results.",
    "Your dreams are worth the effort. 💗",
    "Rest if you need to, but don't give up.",
    "One chapter at a time. One victory at a time.",
    "You are allowed to bloom at your own pace.",
    "Believe in the person you are becoming."
];

function newQuote() {
    $("quote").textContent =
        quotes[Math.floor(Math.random()*quotes.length)];
}

$("newQuote").onclick = newQuote;

function showPopup(message) {
    $("popupText").textContent = message;
    $("popup").style.display = "flex";
}

$("closePopup").onclick = () => {
    $("popup").style.display = "none";
};

$("motivate").onclick = () => {
    showPopup("🌷 Take a deep breath. You don't have to finish everything today. Just take one small step. You are doing better than you think. 💗");
};

$("themeBtn").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "rv_theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
};

if(localStorage.getItem("rv_theme")==="dark") {
    document.body.classList.add("dark");
}

function updateChart() {
    if(!window.Chart) return;

    const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const d = new Date();
    const monday = new Date(d);
    monday.setDate(d.getDate()-(d.getDay()+6)%7);

    const values = labels.map((_,i)=>{
        const day = new Date(monday);
        day.setDate(monday.getDate()+i);
        const key = formatDate(day);

        return sessions
            .filter(s=>s.date===key)
            .reduce((sum,s)=>sum+s.seconds,0)/3600;
    });

    if(window.studyChart) {
        window.studyChart.destroy();
    }

    window.studyChart = new Chart($("studyChart"),{
        type:"bar",
        data:{
            labels,
            datasets:[{
                label:"Study Hours",
                data:values,
                backgroundColor:[
                    "#e8a0b5","#c9a5dc","#f4bcae",
                    "#a8d5c2","#f1d18c","#b5c9ed","#df9fbc"
                ],
                borderRadius:10
            }]
        },
        options:{
            responsive:true,
            scales:{y:{beginAtZero:true}}
        }
    });
}

if(localStorage.getItem("rv_quote_date")!==today()) {
    newQuote();
    localStorage.setItem("rv_quote_date",today());

    setTimeout(()=>{
        showPopup($("quote").textContent);
    },700);
} else {
    newQuote();
}

dashboard();
renderTasks();
renderEvents();
updateChart();
displayTimer();
