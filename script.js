(function () {
    "use strict";

    /* ---------------------------------------------------------
       1. Мобільне меню
       --------------------------------------------------------- */
    var navToggle = document.getElementById("navToggle");
    var mainNav = document.getElementById("mainNav");

    if (navToggle && mainNav) {
        navToggle.addEventListener("click", function () {
            var isOpen = mainNav.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            navToggle.setAttribute(
                "aria-label",
                isOpen ? "Закрити меню" : "Відкрити меню"
            );
        });

        mainNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                mainNav.classList.remove("is-open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---------------------------------------------------------
       2. Акордеони (гід А-Я та FAQ)
       --------------------------------------------------------- */
    function setupAccordion(rootId, keepFirstOpen) {
        var root = document.getElementById(rootId);
        if (!root) return;

        var items = Array.prototype.slice.call(root.querySelectorAll(".acc-item"));

        function closeItem(item) {
            var trigger = item.querySelector(".acc-trigger");
            var panel = item.querySelector(".acc-panel");
            trigger.setAttribute("aria-expanded", "false");
            panel.style.maxHeight = "0px";
        }

        function openItem(item) {
            var trigger = item.querySelector(".acc-trigger");
            var panel = item.querySelector(".acc-panel");
            trigger.setAttribute("aria-expanded", "true");
            panel.style.maxHeight = panel.scrollHeight + "px";
        }

        items.forEach(function (item, index) {
            var trigger = item.querySelector(".acc-trigger");
            var panel = item.querySelector(".acc-panel");

            // початковий стан
            if (keepFirstOpen && index === 0) {
                openItem(item);
            } else {
                panel.style.maxHeight = "0px";
                trigger.setAttribute("aria-expanded", "false");
            }

            trigger.addEventListener("click", function () {
                var isOpen = trigger.getAttribute("aria-expanded") === "true";
                // одна секція відкрита за раз, як у справжньому журналі
                items.forEach(closeItem);
                if (!isOpen) openItem(item);
            });
        });

        // Перерахунок висоти відкритої панелі при зміні розміру вікна
        window.addEventListener("resize", function () {
            items.forEach(function (item) {
                var trigger = item.querySelector(".acc-trigger");
                var panel = item.querySelector(".acc-panel");
                if (trigger.getAttribute("aria-expanded") === "true") {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        });
    }

    setupAccordion("guideAccordion", true);
    setupAccordion("faqAccordion", false);

    /* ---------------------------------------------------------
       3. Розрахунок дат від дня парування
       --------------------------------------------------------- */
    var calcForm = document.getElementById("calcForm");
    var calcResult = document.getElementById("calcResult");
    var calcList = document.getElementById("calcList");
    var calcNote = document.getElementById("calcNote");

    var MONTHS_UK = [
        "січня", "лютого", "березня", "квітня", "травня", "червня",
        "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
    ];

    function formatDateUk(date) {
        return date.getDate() + " " + MONTHS_UK[date.getMonth()] + " " + date.getFullYear();
    }

    function addDays(baseDate, days) {
        var d = new Date(baseDate.getTime());
        d.setDate(d.getDate() + days);
        return d;
    }

    function buildScheduleItem(dateLabel, description) {
        var li = document.createElement("li");

        var dateSpan = document.createElement("span");
        dateSpan.className = "calc-date";
        dateSpan.textContent = dateLabel;

        var textSpan = document.createElement("span");
        textSpan.textContent = description;

        li.appendChild(dateSpan);
        li.appendChild(textSpan);
        return li;
    }

    if (calcForm) {
        calcForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var input = document.getElementById("matingDate");
            if (!input || !input.value) return;

            // Парсимо як локальну дату (без зсуву часового поясу)
            var parts = input.value.split("-").map(Number);
            var matingDate = new Date(parts[0], parts[1] - 1, parts[2]);

            var schedule = [
                { offset: 0, text: "День парування — відлік розпочато." },
                { offset: 25, text: "Миємо й дезінфікуємо клітку та маточник, даємо висохнути." },
                { offset: 27, text: "Заносимо маточник у клітку, встеляємо сіном. Якщо він вмонтований — відкриваємо лаз." },
                { offset: 31, text: "Орієнтовний окріл (норма 28–33 день — стежте за поведінкою самиці)." },
                { offset: 49, text: "Кроленята починають виходити з гнізда — лаз відкриваємо повністю." },
                { offset: 61, text: "Час забирати маточник із клітки та провести дезінфекцію відсіку." }
            ];

            calcList.innerHTML = "";
            schedule.forEach(function (step) {
                var date = addDays(matingDate, step.offset);
                calcList.appendChild(buildScheduleItem(formatDateUk(date), step.text));
            });

            calcNote.textContent =
                "Дати орієнтовні: справжній сигнал — поведінка кролематки, а не число в календарі.";

            calcResult.hidden = false;
            calcResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    }

    /* ---------------------------------------------------------
       4. Демонстрація заслінки лазу у вмонтованому маточнику
       --------------------------------------------------------- */
    var doorToggle = document.getElementById("doorToggle");
    var doorIcon = document.getElementById("doorIcon");
    var doorToggleText = document.getElementById("doorToggleText");
    var builtinIllustration = document.getElementById("builtinIllustration");

    if (doorToggle && builtinIllustration) {
        doorToggle.addEventListener("click", function () {
            var isOpen = builtinIllustration.classList.toggle("is-open");
            doorToggle.setAttribute("aria-pressed", isOpen ? "true" : "false");
            doorIcon.textContent = isOpen ? "🔓" : "🔒";
            doorToggleText.textContent = isOpen
                ? "Лаз відкритий — торкніться, щоб закрити"
                : "Лаз закритий — торкніться, щоб відкрити";
        });
    }

    /* ---------------------------------------------------------
       5. Активне посилання в навігації відповідно до секції
       --------------------------------------------------------- */
    var sections = document.querySelectorAll("main section[id]");
    var navLinks = document.querySelectorAll(".main-nav a");

    if ("IntersectionObserver" in window && sections.length && navLinks.length) {
        var navObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var id = entry.target.getAttribute("id");
                    navLinks.forEach(function (link) {
                        var matches = link.getAttribute("href") === "#" + id;
                        link.style.color = matches ? "var(--rust)" : "";
                    });
                });
            },
            { rootMargin: "-45% 0px -45% 0px" }
        );

        sections.forEach(function (section) {
            navObserver.observe(section);
        });
    }
})();