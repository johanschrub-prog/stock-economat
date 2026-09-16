let currentTab = "devant";

let data = JSON.parse(localStorage.getItem("caveData")) || {
    devant: [],
    champagne: [],
    alcool: []
};

function save() {
    localStorage.setItem(
        "caveData",
        JSON.stringify(data)
    );
}

function changeTab(tab, button) {

    currentTab = tab;

    document
        .querySelectorAll(".tab")
        .forEach(t => t.classList.remove("active"));

    button.classList.add("active");

    render();
}

function setQty(index, valeur) {

    data[currentTab][index].quantite =
        parseInt(valeur) || 0;

    save();
}

function render() {

    const recherche =
        document
        .getElementById("search")
        .value
        .toLowerCase();

    let html = "";

    data[currentTab]
    .filter(item =>
        item.article &&
        item.article
        .toLowerCase()
        .includes(recherche)
    )
    .forEach((item, index) => {

        html += `
        <div class="card">

            <div class="article">
                ${item.article}
            </div>

            <div>
                Code : ${item.code}
            </div>

            <div style="margin-top:10px">

                <input
                type="number"
                value="${item.quantite}"
                style="
                    width:100%;
                    padding:10px;
                    font-size:22px;
                    text-align:center;
                    border-radius:8px;
                    border:1px solid #ccc;
                "
                onchange="setQtyByCode('${item.code}',this.value)">

            </div>

            <div class="actions">

                <button
                class="edit"
                onclick="editArticle(${index})">
                Modifier
                </button>

                <button
                class="delete"
                onclick="deleteArticle(${index})">
                Supprimer
                </button>

            </div>

        </div>
        `;

    });

    document.getElementById("cards").innerHTML = html;
}
function setQtyByCode(code, valeur) {

    const article =
        data[currentTab].find(
            a => String(a.code) === String(code)
        );

    if (!article) return;

    article.quantite =
        parseInt(valeur) || 0;

    save();
}
            </div>

            <div class="actions">

                <button
                class="edit"
                onclick="editArticle(${index})">
                Modifier
                </button>

                <button
                class="delete"
                onclick="deleteArticle(${index})">
                Supprimer
                </button>

            </div>

        </div>
        `;
    });

    document.getElementById("cards").innerHTML = html;
}
function setQtyByCode(code, valeur) {

    const article =
        data[currentTab].find(
            a => String(a.code) === String(code)
        );

    if (!article) return;

    article.quantite =
        parseInt(valeur) || 0;

    save();
}
function addArticle() {

    const code = prompt("Code article");

    if (!code) return;

    const article = prompt("Nom article");

    if (!article) return;

    const quantite =
        parseInt(prompt("Quantité", "0")) || 0;

    data[currentTab].push({
        code,
        article,
        quantite
    });

    save();
    render();
}

function editArticle(index) {

    const item = data[currentTab][index];

    item.code =
        prompt("Code", item.code)
        || item.code;

    item.article =
        prompt("Article", item.article)
        || item.article;

    item.quantite =
        parseInt(
            prompt(
                "Quantité",
                item.quantite
            )
        ) || 0;

    save();
    render();
}

function deleteArticle(index) {

    if (
        !confirm(
            "Supprimer cet article ?"
        )
    ) return;

    data[currentTab].splice(index, 1);

    save();
    render();
}

function resetStock() {

    if (
        !confirm(
            "Mettre toutes les quantités à zéro ?"
        )
    ) return;

    Object.keys(data).forEach(cat => {

        data[cat].forEach(item => {
            item.quantite = 0;
        });

    });

    save();
    render();
}

function exportExcel() {

    if (typeof XLSX === "undefined") {
        alert("Bibliothèque Excel non chargée");
        return;
    }

    const wb = XLSX.utils.book_new();

    function ajouterFeuille(
        nom,
        donnees
    ) {

        const ws =
            XLSX.utils.json_to_sheet(
                donnees.map(item => ({
                    CODE: item.code,
                    ARTICLE: item.article,
                    QUANTITE: item.quantite
                }))
            );

        XLSX.utils.book_append_sheet(
            wb,
            ws,
            nom
        );
    }

    ajouterFeuille(
        "DEVANT BAR",
        data.devant
    );

    ajouterFeuille(
        "ARRIERE BAR CHAMPAGNE",
        data.champagne
    );

    ajouterFeuille(
        "ARRIERE BAR ALCOOL",
        data.alcool
    );

    XLSX.writeFile(
        wb,
        "REMONTEE_DE_CAVE.xlsx"
    );
}

function importExcel(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = function(e) {

        const workbook =
            XLSX.read(
                e.target.result,
                { type: "array" }
            );

        let imported = {
            devant: [],
            champagne: [],
            alcool: []
        };

        function lireFeuille(
            nom,
            destination
        ) {

            const sheet =
                workbook.Sheets[nom];

            if (!sheet) return;

            const rows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    { header: 1 }
                );

            rows.forEach(row => {

                if (
                    !row ||
                    row.length < 2
                ) return;

                const code = row[0];
                const article = row[1];

                if (
                    !article ||
                    article === "ARTICLE"
                ) return;

                destination.push({
                    code: String(code || ""),
                    article: String(article),
                    quantite: 0
                });

            });

        }

        lireFeuille(
            "DEVANT BAR",
            imported.devant
        );

        lireFeuille(
            "ARRIERE BAR CHAMPAGNE",
            imported.champagne
        );

        lireFeuille(
            "ARRIERE BAR ALCOOL",
            imported.alcool
        );

        data = imported;

        save();
        render();

        alert("Import Excel terminé");

    };

    reader.readAsArrayBuffer(file);
}

render();
