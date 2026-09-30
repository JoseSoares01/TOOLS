/**
 * Almoço Anisabel
 * - Alarme 14:00, segunda a sexta
 * - Som contínuo até clicar em "Almoço"
 * - Depois: countdown 60 minutos (anel + digital + ponteiros)
 */

(function () {
    "use strict";

    var STORAGE_ACK = "almoco_anisabel_ack_date_v2";
    var STORAGE_END = "almoco_anisabel_countdown_end_v2";
    var LUNCH_HOUR = 14;
    var LUNCH_MINUTE = 0;
    var COUNTDOWN_MS = 60 * 60 * 1000;
    var RING_LEN = 515.22; // 2 * Math.PI * 82

    var phase = "idle"; // idle | alarming | counting | done
    var audioEnabled = false;
    var audioCtx = null;
    var alarmTimer = null;
    var tickTimer = null;
    var testMode = false;

    var els = {};

    function $(id) {
        return document.getElementById(id);
    }

    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function todayKey(d) {
        d = d || new Date();
        return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    function isWeekday(d) {
        d = d || new Date();
        var day = d.getDay();
        return day >= 1 && day <= 5;
    }

    function lunchMomentToday(d) {
        d = d || new Date();
        var t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), LUNCH_HOUR, LUNCH_MINUTE, 0, 0);
        return t;
    }

    function nextLunchDate(from) {
        from = from || new Date();
        var probe = new Date(from.getTime());
        for (var i = 0; i < 8; i++) {
            var lunch = lunchMomentToday(probe);
            if (isWeekday(probe) && lunch.getTime() > from.getTime()) {
                return lunch;
            }
            if (isWeekday(probe) && i === 0 && from.getTime() < lunch.getTime()) {
                return lunch;
            }
            probe.setDate(probe.getDate() + 1);
            probe.setHours(0, 0, 0, 0);
        }
        return lunchMomentToday(from);
    }

    function formatCountdown(ms) {
        var totalSec = Math.max(0, Math.ceil(ms / 1000));
        var m = Math.floor(totalSec / 60);
        var s = totalSec % 60;
        return pad(m) + ":" + pad(s);
    }

    function formatNextHint(date) {
        if (!date) return "Próximo alarme: —";
        var days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        return (
            "Próximo alarme: " +
            days[date.getDay()] +
            ", " +
            pad(date.getDate()) +
            "/" +
            pad(date.getMonth() + 1) +
            " às " +
            pad(date.getHours()) +
            ":" +
            pad(date.getMinutes())
        );
    }

    /* ---------- Áudio ---------- */
    function ensureAudio() {
        if (!audioCtx) {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function beepOnce() {
        var ctx = ensureAudio();
        if (!ctx) return;

        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(660, now + 0.18);
        osc.frequency.setValueAtTime(990, now + 0.36);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
    }

    function startAlarmSound() {
        stopAlarmSound();
        if (!audioEnabled) return;
        beepOnce();
        alarmTimer = setInterval(beepOnce, 900);
    }

    function stopAlarmSound() {
        if (alarmTimer) {
            clearInterval(alarmTimer);
            alarmTimer = null;
        }
    }

    function enableAudio() {
        var ctx = ensureAudio();
        if (!ctx) {
            els.audioStatus.textContent = "Som: não suportado neste browser.";
            els.audioStatus.className = "audio-status is-warn";
            return;
        }
        audioEnabled = true;
        beepOnce();
        els.audioStatus.textContent = "Som: ativado ✓";
        els.audioStatus.className = "audio-status is-ok";
        els.btnEnableAudio.textContent = "Som ativo";
    }

    /* ---------- UI ---------- */
    function setRingProgress(ratio) {
        /* ratio 1 = cheio, 0 = vazio (tempo consumido) */
        var r = Math.max(0, Math.min(1, ratio));
        els.ringProgress.style.strokeDashoffset = String(RING_LEN * (1 - r));
    }

    function setHands(remainingMs, totalMs) {
        totalMs = totalMs || COUNTDOWN_MS;
        var remaining = Math.max(0, remainingMs);
        var elapsed = Math.max(0, totalMs - remaining);
        var totalSec = remaining / 1000;
        var minutes = (totalSec / 60) % 60;
        var seconds = totalSec % 60;
        /* Ponteiro de horas ≈ progresso da hora de almoço (volta completa = 60 min) */
        var hourDeg = (elapsed / totalMs) * 360;
        var minuteDeg = (minutes / 60) * 360;
        var secondDeg = (seconds / 60) * 360;

        els.handHour.style.transform = "rotate(" + hourDeg + "deg)";
        els.handMinute.style.transform = "rotate(" + minuteDeg + "deg)";
        els.handSecond.style.transform = "rotate(" + secondDeg + "deg)";
    }

    function setPhaseUI(next) {
        phase = next;
        els.watchFace.setAttribute("data-phase", next);
        els.btnAlmoco.classList.toggle("is-urgent", next === "alarming");
        els.btnAlmoco.disabled = next !== "alarming";

        els.statusChip.classList.remove("almoco-chip--accent", "almoco-chip--alarm", "almoco-chip--count");

        if (next === "idle") {
            els.statusChip.textContent = "A aguardar";
            els.statusChip.classList.add("almoco-chip--accent");
            els.watchLabel.textContent = "Almoço";
            els.watchTime.textContent = "60:00";
            els.watchSub.textContent = "a aguardar 14:00";
            els.actionTitle.textContent = "Estado do alarme";
            els.actionText.textContent =
                "Mantenha esta página aberta para o alarme disparar às 14:00 (segunda a sexta).";
            setRingProgress(1);
            setHands(COUNTDOWN_MS, COUNTDOWN_MS);
        } else if (next === "alarming") {
            els.statusChip.textContent = "Alarme!";
            els.statusChip.classList.add("almoco-chip--alarm");
            els.watchLabel.textContent = "Agora";
            els.watchTime.textContent = "14:00";
            els.watchSub.textContent = "hora de almoço";
            els.actionTitle.textContent = "Hora de almoço, Anisabel!";
            els.actionText.textContent =
                "O alarme só para quando clicar no botão Almoço. Depois começa a contagem de 1 hora.";
            setRingProgress(1);
        } else if (next === "counting") {
            els.statusChip.textContent = "Em contagem";
            els.statusChip.classList.add("almoco-chip--count");
            els.watchLabel.textContent = "Restante";
            els.actionTitle.textContent = "Intervalo de almoço";
            els.actionText.textContent = "Contagem regressiva de 60 minutos. O aro vai desaparecendo com o tempo.";
        } else if (next === "done") {
            els.statusChip.textContent = "Concluído";
            els.statusChip.classList.add("almoco-chip--accent");
            els.watchLabel.textContent = "Fim";
            els.watchTime.textContent = "00:00";
            els.watchSub.textContent = "intervalo terminou";
            els.actionTitle.textContent = "Almoço concluído";
            els.actionText.textContent = "Bom regresso ao trabalho. O próximo alarme será no próximo dia útil às 14:00.";
            setRingProgress(0);
            setHands(0, COUNTDOWN_MS);
        }
    }

    function updateWeekdayChip(now) {
        els.weekdayChip.textContent = isWeekday(now) ? "Dia útil" : "Fim de semana";
    }

    function updateNextHint(now) {
        if (phase === "counting" || phase === "alarming") {
            els.nextHint.textContent =
                phase === "alarming"
                    ? "Alarme ativo — clique em Almoço"
                    : "Intervalo em curso";
            return;
        }
        els.nextHint.textContent = formatNextHint(nextLunchDate(now));
    }

    /* ---------- Estado ---------- */
    function getCountdownEnd() {
        var raw = localStorage.getItem(STORAGE_END);
        if (!raw) return null;
        var n = parseInt(raw, 10);
        return isNaN(n) ? null : n;
    }

    function setCountdownEnd(ts) {
        if (ts == null) localStorage.removeItem(STORAGE_END);
        else localStorage.setItem(STORAGE_END, String(ts));
    }

    function getAckDate() {
        return localStorage.getItem(STORAGE_ACK) || "";
    }

    function setAckDate(key) {
        localStorage.setItem(STORAGE_ACK, key);
    }

    function shouldAlarm(now) {
        if (testMode) return true;
        if (!isWeekday(now)) return false;
        if (getAckDate() === todayKey(now)) return false;
        var lunch = lunchMomentToday(now);
        return now.getTime() >= lunch.getTime();
    }

    function startCountdown(now) {
        testMode = false;
        stopAlarmSound();
        var end = (now || new Date()).getTime() + COUNTDOWN_MS;
        setCountdownEnd(end);
        setAckDate(todayKey(now || new Date()));
        setPhaseUI("counting");
    }

    function onAlmocoClick() {
        if (phase !== "alarming") return;
        startCountdown(new Date());
    }

    function onTestAlarm() {
        testMode = true;
        setPhaseUI("alarming");
        startAlarmSound();
    }

    function tick() {
        var now = new Date();
        updateWeekdayChip(now);
        updateNextHint(now);

        var end = getCountdownEnd();

        if (end) {
            var remaining = end - now.getTime();
            if (remaining > 0) {
                if (phase !== "counting") setPhaseUI("counting");
                els.watchTime.textContent = formatCountdown(remaining);
                els.watchSub.textContent = "de 60 minutos";
                setRingProgress(remaining / COUNTDOWN_MS);
                setHands(remaining, COUNTDOWN_MS);
                stopAlarmSound();
                return;
            }
            /* acabou */
            setCountdownEnd(null);
            setPhaseUI("done");
            stopAlarmSound();
            return;
        }

        if (shouldAlarm(now)) {
            if (phase !== "alarming") {
                setPhaseUI("alarming");
                startAlarmSound();
            } else if (audioEnabled && !alarmTimer) {
                startAlarmSound();
            }
            return;
        }

        /* Sem alarme ativo nem countdown */
        if (phase === "alarming") {
            testMode = false;
            stopAlarmSound();
            setPhaseUI("idle");
            return;
        }

        if (phase === "done") {
            var lunchToday = lunchMomentToday(now);
            if (now.getTime() < lunchToday.getTime()) {
                setPhaseUI("idle");
            }
            stopAlarmSound();
            return;
        }

        if (phase !== "idle") {
            setPhaseUI("idle");
        }
        stopAlarmSound();
    }

    function bind() {
        els.btnAlmoco.addEventListener("click", onAlmocoClick);
        els.btnEnableAudio.addEventListener("click", enableAudio);
        els.btnTestAlarm.addEventListener("click", onTestAlarm);

        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === "visible") tick();
        });
    }

    function init() {
        els = {
            watchFace: $("watchFace"),
            ringProgress: $("ringProgress"),
            handHour: $("handHour"),
            handMinute: $("handMinute"),
            handSecond: $("handSecond"),
            watchLabel: $("watchLabel"),
            watchTime: $("watchTime"),
            watchSub: $("watchSub"),
            btnAlmoco: $("btnAlmoco"),
            btnEnableAudio: $("btnEnableAudio"),
            btnTestAlarm: $("btnTestAlarm"),
            audioStatus: $("audioStatus"),
            statusChip: $("statusChip"),
            weekdayChip: $("weekdayChip"),
            nextHint: $("nextHint"),
            actionTitle: $("actionTitle"),
            actionText: $("actionText"),
        };

        els.ringProgress.style.strokeDasharray = String(RING_LEN);
        bind();

        var end = getCountdownEnd();
        if (end && end > Date.now()) {
            setPhaseUI("counting");
        } else if (end && end <= Date.now()) {
            setCountdownEnd(null);
            setPhaseUI("done");
        } else {
            setPhaseUI("idle");
        }

        tick();
        tickTimer = setInterval(tick, 250);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
