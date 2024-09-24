let appointments = [];

// Funktion zum Hinzufügen eines Termins
function addAppointment() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    if (!date || !time) {
        alert('Bitte Datum und Uhrzeit für den Termin angeben.');
        return;
    }
    appointments.push({ date, time });
    updateAppointmentsList();
}

function syncTimeInput() {
    const timeSelect = document.getElementById('timeSelect'); // Das Dropdown-Element
    const timeInput = document.getElementById('time'); // Das Eingabefeld für die Uhrzeit

    // Setzt den Wert des Eingabefelds gleich dem ausgewählten Wert des Dropdowns
    timeInput.value = timeSelect.value;
}


// Funktion zum Aktualisieren der Liste der hinzugefügten Termine
function updateAppointmentsList() {
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = '<h4>Hinzugefügte Termine:</h4>';
    appointments.forEach(app => {
        const formattedDate = formatDate(app.date, app.time);
        const appointmentElement = document.createElement('div');
        appointmentElement.className = 'appointment-item';
        appointmentElement.innerHTML = `<p>${formattedDate}</p><button onclick="removeAppointment(${appointments.indexOf(app)})">Entfernen</button>`;
        appointmentsList.appendChild(appointmentElement);
    });
}


// Funktion zum Formatieren des Datums und der Uhrzeit
function formatDate(date, time) {
    const dateObj = new Date(`${date}T${time}`);
    const day = ('0' + dateObj.getDate()).slice(-2);
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();
    const hours = ('0' + dateObj.getHours()).slice(-2);
    const minutes = ('0' + dateObj.getMinutes()).slice(-2);
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Funktion zum Entfernen eines Termins
function removeAppointment(index) {
    appointments.splice(index, 1);
    updateAppointmentsList();
}

function copyAppointmentsToClipboard() {
    const appointmentsList = document.getElementById('appointmentsList');
    const appointments = appointmentsList.querySelectorAll('p');
    let textToCopy = '';

    appointments.forEach(app => {
        textToCopy += app.textContent.replace(' Entfernen', '') + '\n'; // ' Entfernen' wird entfernt, um nur die Termininfos zu kopieren
    });

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('Termine wurden in die Zwischenablage kopiert.');
        })
        .catch(err => {
            console.error('Fehler beim Kopieren in die Zwischenablage: ', err);
            alert('Fehler beim Kopieren der Termine.');
        });
}

function exportAppointments() {
    // Titel, Dauer und weitere Felder aus dem Formular holen
    const title = document.getElementById('title').value;
    const duration = parseInt(document.getElementById('duration').value, 10) * 60000; // Dauer in Millisekunden
    const location = document.getElementById('location').value || 'Kein Ort angegeben';
    const description = document.getElementById('description').value || 'Keine Beschreibung vorhanden';
    const status = document.getElementById('status').value || 'TENTATIVE';
    const url = document.getElementById('url').value;

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//hacksw/handcal//NONSGML v1.0//EN'
    ];

    appointments.forEach(({date, time}) => {
        const startTime = new Date(`${date}T${time}`);
        const endTime = new Date(startTime.getTime() + duration); // Endzeit basierend auf Dauer

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            console.error("Ungültiges Datum oder Zeit", { date, time });
            return; // Überspringt diesen Eintrag, falls ungültig
        }

        const startDate = formatDateForICS(startTime);
        const endDate = formatDateForICS(endTime);

        icsContent.push(
            'BEGIN:VEVENT',
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${title}`,
            `LOCATION:${location}`,
            `DESCRIPTION:${description}`,
            `STATUS:${status}`,
            url ? `URL:${url}` : '',
            'END:VEVENT'
        );
    });

    icsContent.push('END:VCALENDAR');
    
    downloadICS(icsContent.join('\r\n'));
}

function formatDateForICS(date) {
    const pad = num => String(num).padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function downloadICS(content) {
    const blob = new Blob([content], {type: 'text/calendar;charset=utf-8'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'appointments.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

