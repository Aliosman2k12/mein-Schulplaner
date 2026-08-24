// ==========================
// BENUTZER
// ==========================

let aktuellerBenutzer = null;

async function benutzerLaden() {

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "login.html";
        return null;
    }

    aktuellerBenutzer = data.user;

    return data.user;
}


// ==========================
// TERMINE
// ==========================

let termine = [];

async function termineLaden() {

    const user = await benutzerLaden();

    if (!user) return;

    const { data, error } =
        await supabaseClient
            .from("termine")
            .select("*")
            .eq("user_id", user.id)
            .order("datum", { ascending: true });

    if (error) {

        console.error(error);

        alert("Termine konnten nicht geladen werden.");

        return;
    }

    termine = data || [];

    termineAnzeigen();
    kalenderAnzeigen();
    startseiteAnzeigen();
}


async function terminHinzufuegen() {

    const fach =
        document.getElementById("fach").value;

    const art =
        document.getElementById("art").value;

    const beschreibung =
        document.getElementById("beschreibung").value;

    const datum =
        document.getElementById("datum").value;

    if (
        fach === "" ||
        beschreibung === "" ||
        datum === ""
    ) {

        alert("Bitte fülle alle Felder aus!");

        return;
    }

    const user = await benutzerLaden();

    if (!user) return;

    const { error } =
        await supabaseClient
            .from("termine")
            .insert({
                user_id: user.id,
                fach: fach,
                art: art,
                beschreibung: beschreibung,
                datum: datum
            });

    if (error) {

        console.error(error);

        alert("Termin konnte nicht gespeichert werden.");

        return;
    }

    document.getElementById("fach").value = "";
    document.getElementById("beschreibung").value = "";
    document.getElementById("datum").value = "";

    await termineLaden();
}


async function terminLoeschen(index) {

    const termin = termine[index];

    if (!termin) return;

    const { error } =
        await supabaseClient
            .from("termine")
            .delete()
            .eq("id", termin.id)
            .eq("user_id", aktuellerBenutzer.id);

    if (error) {

        console.error(error);

        alert("Termin konnte nicht gelöscht werden.");

        return;
    }

    termine.splice(index, 1);

    termineAnzeigen();
    kalenderAnzeigen();
    startseiteAnzeigen();
}


function termineAnzeigen() {

    const container =
        document.getElementById("termine");

    if (!container) return;

    container.innerHTML = "";

    if (termine.length === 0) {

        container.innerHTML =
            "<p>Keine Termine vorhanden.</p>";

        return;
    }

    termine.sort(
        (a, b) =>
            new Date(a.datum) -
            new Date(b.datum)
    );

    termine.forEach((termin, index) => {

        const div =
            document.createElement("div");

        div.className = "termin";

        div.innerHTML = `
            <h3>${termin.art} – ${termin.fach}</h3>

            <p>${termin.beschreibung}</p>

            <p>${termin.datum}</p>

            <button onclick="terminLoeschen(${index})">
                Löschen
            </button>
        `;

        container.appendChild(div);
    });
}


// ==========================
// MONATSKALENDER
// ==========================

let kalenderDatum = new Date();


function kalenderAnzeigen() {

    const kalender =
        document.getElementById("kalender");

    if (!kalender) return;

    const monatJahr =
        document.getElementById("monatJahr");

    const jahr =
        kalenderDatum.getFullYear();

    const monat =
        kalenderDatum.getMonth();

    const monatsNamen = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
    ];

    monatJahr.innerText =
        monatsNamen[monat] + " " + jahr;

    kalender.innerHTML = "";

    let ersterTag =
        new Date(jahr, monat, 1);

    let startTag =
        ersterTag.getDay() - 1;

    if (startTag === -1) {
        startTag = 6;
    }

    const tageImMonat =
        new Date(
            jahr,
            monat + 1,
            0
        ).getDate();

    for (let i = 0; i < startTag; i++) {

        const leer =
            document.createElement("div");

        leer.className =
            "kalender-tag leerer-tag";

        kalender.appendChild(leer);
    }

    for (
        let tag = 1;
        tag <= tageImMonat;
        tag++
    ) {

        const div =
            document.createElement("div");

        div.className =
            "kalender-tag";

        const heute = new Date();

        if (
            tag === heute.getDate() &&
            monat === heute.getMonth() &&
            jahr === heute.getFullYear()
        ) {

            div.classList.add("heute");
        }

        div.innerHTML = `
            <div class="tag-nummer">
                ${tag}
            </div>
        `;

        termine.forEach((termin, index) => {

            const terminDatum =
                new Date(termin.datum);

            if (
                terminDatum.getDate() === tag &&
                terminDatum.getMonth() === monat &&
                terminDatum.getFullYear() === jahr
            ) {

                const terminDiv =
                    document.createElement("div");

                terminDiv.className =
                    "kalender-termin";

                terminDiv.innerHTML = `
                    <span>
                        ${termin.art} – ${termin.fach}
                    </span>

                    <button
                        onclick="terminLoeschen(${index})"
                    >
                        ×
                    </button>
                `;

                div.appendChild(terminDiv);
            }
        });

        kalender.appendChild(div);
    }
}


function monatZurueck() {

    kalenderDatum.setMonth(
        kalenderDatum.getMonth() - 1
    );

    kalenderAnzeigen();
}


function monatVor() {

    kalenderDatum.setMonth(
        kalenderDatum.getMonth() + 1
    );

    kalenderAnzeigen();
}


// ==========================
// NOTEN
// ==========================

let noten = [];


async function notenLaden() {

    const user =
        await benutzerLaden();

    if (!user) return;

    const { data, error } =
        await supabaseClient
            .from("noten")
            .select("*")
            .eq("user_id", user.id)
            .order("id", { ascending: true });

    if (error) {

        console.error(error);

        alert("Noten konnten nicht geladen werden.");

        return;
    }

    noten = data || [];

    notenAnzeigen();
    startseiteAnzeigen();
}


async function noteHinzufuegen() {

    const fachElement =
        document.getElementById("notenFach");

    const noteElement =
        document.getElementById("note");

    if (!fachElement || !noteElement)
        return;

    const fach =
        fachElement.value;

    const note =
        Number(noteElement.value);

    const user =
        await benutzerLaden();

    if (!user) return;

    const { error } =
        await supabaseClient
            .from("noten")
            .insert({
                user_id: user.id,
                fach: fach,
                note: note
            });

    if (error) {

        console.error(error);

        alert("Note konnte nicht gespeichert werden.");

        return;
    }

    await notenLaden();
}


async function noteLoeschen(index) {

    const eintrag =
        noten[index];

    if (!eintrag) return;

    const { error } =
        await supabaseClient
            .from("noten")
            .delete()
            .eq("id", eintrag.id)
            .eq("user_id", aktuellerBenutzer.id);

    if (error) {

        console.error(error);

        alert("Note konnte nicht gelöscht werden.");

        return;
    }

    noten.splice(index, 1);

    notenAnzeigen();
    startseiteAnzeigen();
}


function notenAnzeigen() {

    const container =
        document.getElementById("notenListe");

    if (!container) return;

    container.innerHTML = "";

    if (noten.length === 0) {

        container.innerHTML =
            "<p>Noch keine Noten vorhanden.</p>";

        const durchschnitt =
            document.getElementById("durchschnitt");

        if (durchschnitt) {

            durchschnitt.innerText =
                "Noch keine Noten";
        }

        return;
    }

    let summe = 0;

    noten.forEach(
        (eintrag, index) => {

            summe +=
                Number(eintrag.note);

            const div =
                document.createElement("div");

            div.className =
                "termin";

            div.innerHTML = `
                <h3>${eintrag.fach}</h3>

                <p>
                    Note:
                    <strong>
                        ${eintrag.note}
                    </strong>
                </p>

                <button
                    onclick="noteLoeschen(${index})"
                >
                    Löschen
                </button>
            `;

            container.appendChild(div);
        }
    );

    const durchschnitt =
        summe / noten.length;

    const durchschnittElement =
        document.getElementById("durchschnitt");

    if (durchschnittElement) {

        durchschnittElement.innerText =
            durchschnitt.toFixed(2);
    }
}


// ==========================
// TAGESZIELE
// ==========================

let ziele = [];

const heuteDatum =
    new Date()
        .toISOString()
        .split("T")[0];


async function zieleLaden() {

    const user =
        await benutzerLaden();

    if (!user) return;

    const { data, error } =
        await supabaseClient
            .from("tagesziele")
            .select("*")
            .eq("user_id", user.id)
            .eq("datum", heuteDatum)
            .order("id", { ascending: true });

    if (error) {

        console.error(error);

        alert("Tagesziele konnten nicht geladen werden.");

        return;
    }

    ziele = data || [];

    zieleAnzeigen();
}


async function zielHinzufuegen() {

    const input =
        document.getElementById("zielInput");

    if (!input) return;

    const text =
        input.value.trim();

    if (text === "") {

        alert("Bitte gib ein Ziel ein!");

        return;
    }

    const user =
        await benutzerLaden();

    if (!user) return;

    const { error } =
        await supabaseClient
            .from("tagesziele")
            .insert({
                user_id: user.id,
                datum: heuteDatum,
                text: text,
                erledigt: false
            });

    if (error) {

        console.error(error);

        alert("Ziel konnte nicht gespeichert werden.");

        return;
    }

    input.value = "";

    await zieleLaden();
}


async function zielAbhaken(index) {

    const ziel =
        ziele[index];

    if (!ziel) return;

    const { error } =
        await supabaseClient
            .from("tagesziele")
            .update({
                erledigt: !ziel.erledigt
            })
            .eq("id", ziel.id)
            .eq("user_id", aktuellerBenutzer.id);

    if (error) {

        console.error(error);

        alert("Ziel konnte nicht geändert werden.");

        return;
    }

    await zieleLaden();
}


async function zielLoeschen(index) {

    const ziel =
        ziele[index];

    if (!ziel) return;

    const { error } =
        await supabaseClient
            .from("tagesziele")
            .delete()
            .eq("id", ziel.id)
            .eq("user_id", aktuellerBenutzer.id);

    if (error) {

        console.error(error);

        alert("Ziel konnte nicht gelöscht werden.");

        return;
    }

    await zieleLaden();
}


function zieleAnzeigen() {

    const liste =
        document.getElementById("zieleListe");

    if (!liste) return;

    liste.innerHTML = "";

    if (ziele.length === 0) {

        liste.innerHTML =
            "<p>Noch keine Ziele für heute.</p>";

        return;
    }

    ziele.forEach(
        (ziel, index) => {

            const div =
                document.createElement("div");

            div.className =
                "ziel";

            div.innerHTML = `

                <input
                    type="checkbox"
                    ${ziel.erledigt ? "checked" : ""}
                    onchange="zielAbhaken(${index})"
                >

                <span class="${
                    ziel.erledigt
                        ? "ziel-erledigt"
                        : ""
                }">
                    ${ziel.text}
                </span>

                <button
                    onclick="zielLoeschen(${index})"
                >
                    ×
                </button>
            `;

            liste.appendChild(div);
        }
    );
}


// ==========================
// STARTSEITE
// ==========================

function startseiteAnzeigen() {

    const kaAnzeige =
        document.getElementById("naechsteKA");

    const haAnzeige =
        document.getElementById("naechsteHA");

    const durchschnittAnzeige =
        document.getElementById("startDurchschnitt");

    const termineAnzeige =
        document.getElementById("anzahlTermine");

    if (!kaAnzeige)
        return;

    const gespeicherteTermine =
        [...termine].sort(
            (a, b) =>
                new Date(a.datum) -
                new Date(b.datum)
        );

    if (termineAnzeige) {

        termineAnzeige.innerText =
            gespeicherteTermine.length +
            (
                gespeicherteTermine.length === 1
                    ? " Termin"
                    : " Termine"
            );
    }

    const klassenarbeiten =
        gespeicherteTermine.filter(
            termin =>
                termin.art === "KA"
        );

    if (klassenarbeiten.length > 0) {

        const ka =
            klassenarbeiten[0];

        kaAnzeige.innerHTML = `
            <strong>${ka.fach}</strong><br>
            ${ka.beschreibung}<br>
            ${ka.datum}
        `;
    }

    const hausaufgaben =
        gespeicherteTermine.filter(
            termin =>
                termin.art === "HA"
        );

    if (hausaufgaben.length > 0) {

        const ha =
            hausaufgaben[0];

        haAnzeige.innerHTML = `
            <strong>${ha.fach}</strong><br>
            ${ha.beschreibung}<br>
            ${ha.datum}
        `;
    }

    if (
        durchschnittAnzeige &&
        noten.length > 0
    ) {

        let summe = 0;

        noten.forEach(
            eintrag =>
                summe +=
                    Number(eintrag.note)
        );

        const durchschnitt =
            summe / noten.length;

        durchschnittAnzeige.innerHTML =
            `<strong>${durchschnitt.toFixed(2)}</strong>`;
    }
}


// ==========================
// LERNMATERIAL
// ==========================

let materialien = [];


// ==========================
// LERNMATERIAL LADEN
// ==========================

async function materialLaden() {

    const user =
        await benutzerLaden();

    if (!user) return;

    const { data, error } =
        await supabaseClient
            .from("materialien")
            .select("*")
            .eq("user_id", user.id)
            .order("id", { ascending: true });

    if (error) {

        console.error(error);

        alert("Lernmaterial konnte nicht geladen werden.");

        return;
    }

    materialien = data || [];

    materialAnzeigen();
}


// ==========================
// MATERIAL HINZUFÜGEN
// ==========================

async function materialHinzufuegen() {

    const fachElement =
        document.getElementById("materialFach");

    const nameElement =
        document.getElementById("materialName");

    const dateiInput =
        document.getElementById("materialDatei");

    if (
        !fachElement ||
        !nameElement ||
        !dateiInput
    ) {
        return;
    }

    const fach =
        fachElement.value;

    const name =
        nameElement.value.trim();

    const datei =
        dateiInput.files[0];

    if (name === "" || !datei) {

        alert("Bitte Name und Datei auswählen!");

        return;
    }

    const user =
        await benutzerLaden();

    if (!user) return;

    const dateipfad =
        user.id +
        "/" +
        Date.now() +
        "_" +
        datei.name;

    const { error: uploadError } =
        await supabaseClient.storage
            .from("lernmaterial")
            .upload(
                dateipfad,
                datei
            );

    if (uploadError) {

        console.error(uploadError);

        alert("Datei konnte nicht hochgeladen werden.");

        return;
    }

    const { error: dbError } =
        await supabaseClient
            .from("materialien")
            .insert({
                user_id: user.id,
                fach: fach,
                name: name,
                datei_name: datei.name,
                datei_pfad: dateipfad
            });

    if (dbError) {

        console.error(dbError);

        await supabaseClient.storage
            .from("lernmaterial")
            .remove([
                dateipfad
            ]);

        alert("Lernmaterial konnte nicht gespeichert werden.");

        return;
    }

    nameElement.value = "";
    dateiInput.value = "";

    await materialLaden();
}


// ==========================
// MATERIAL ÖFFNEN
// ==========================

async function materialOeffnen(index) {

    const material =
        materialien[index];

    if (!material) return;

    const { data, error } =
        await supabaseClient.storage
            .from("lernmaterial")
            .createSignedUrl(
                material.datei_pfad,
                3600
            );

    if (error) {

        console.error(error);

        alert("Datei konnte nicht geöffnet werden.");

        return;
    }

    window.open(
        data.signedUrl,
        "_blank"
    );
}


// ==========================
// MATERIAL LÖSCHEN
// ==========================

async function materialLoeschen(index) {

    const material =
        materialien[index];

    if (!material) return;

    const user =
        await benutzerLaden();

    if (!user) return;

    const { error: storageError } =
        await supabaseClient.storage
            .from("lernmaterial")
            .remove([
                material.datei_pfad
            ]);

    if (storageError) {

        console.error(storageError);

        alert("Datei konnte nicht gelöscht werden.");

        return;
    }

    const { error: dbError } =
        await supabaseClient
            .from("materialien")
            .delete()
            .eq("id", material.id)
            .eq("user_id", user.id);

    if (dbError) {

        console.error(dbError);

        alert("Lernmaterial konnte nicht gelöscht werden.");

        return;
    }

    await materialLaden();
}


// ==========================
// MATERIAL FILTERN
// ==========================

function materialienFiltern() {

    const filter =
        document.getElementById("fachFilter");

    if (!filter) return;

    const ausgewaehltesFach =
        filter.value;

    if (ausgewaehltesFach === "Alle") {

        materialAnzeigen();

        return;
    }

    const gefilterteMaterialien =
        materialien.filter(
            material =>
                material.fach === ausgewaehltesFach
        );

    materialAnzeigen(gefilterteMaterialien);
}


// ==========================
// MATERIAL ANZEIGEN
// ==========================

function materialAnzeigen(
    liste = materialien
) {

    const container =
        document.getElementById("materialListe");

    if (!container) return;

    container.innerHTML = "";

    if (liste.length === 0) {

        container.innerHTML =
            "<p>Keine Materialien für dieses Fach vorhanden.</p>";

        return;
    }

    liste.forEach(
        (material) => {

            const originalIndex =
                materialien.indexOf(material);

            const div =
                document.createElement("div");

            div.className =
                "termin";

            div.innerHTML = `

                <h3>
                    ${material.fach}
                </h3>

                <p>
                    <strong>
                        ${material.name}
                    </strong>
                </p>

                <p>
                    ${material.datei_name}
                </p>

                <button
                    onclick="materialOeffnen(${originalIndex})"
                >
                    Öffnen
                </button>

                <button
                    onclick="materialLoeschen(${originalIndex})"
                >
                    Löschen
                </button>
            `;

            container.appendChild(div);
        }
    );
}


// ==========================
// START
// ==========================

async function allesStarten() {

    const user =
        await benutzerLaden();

    if (!user)
        return;

    await termineLaden();

    await notenLaden();

    await zieleLaden();

    await materialLaden();
}


allesStarten();
