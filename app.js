let currentTab = "devant";

let data =
JSON.parse(localStorage.getItem("caveData")) || {

devant: [],
champagne: [],
alcool: []

};

function save(){

localStorage.setItem(
"caveData",
JSON.stringify(data)
);

}

function changeTab(tab,button){

currentTab = tab;

document
.querySelectorAll(".tab")
.forEach(t => t.classList.remove("active"));

button.classList.add("active");

render();

}

function sauvegarderJSON(){

    const wb = XLSX.utils.book_new();

    function addSheet(nom, donnees){

        const ws = XLSX.utils.json_to_sheet(
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

    addSheet(
        "DEVANT BAR",
        data.devant
    );

    addSheet(
        "ARRIERE BAR CHAMPAGNE",
        data.champagne
    );

    addSheet(
        "ARRIERE BAR ALCOOL",
        data.alcool
    );

    const maintenant = new Date();

    const fichier =
        "remontee-de-cave-" +
        maintenant.getFullYear() + "-" +
        String(maintenant.getMonth() + 1).padStart(2,"0") + "-" +
        String(maintenant.getDate()).padStart(2,"0") + "-" +
        String(maintenant.getHours()).padStart(2,"0") + "h" +
        String(maintenant.getMinutes()).padStart(2,"0") +
        ".xlsx";

    XLSX.writeFile(
        wb,
        fichier
    );
}



function restaurerJSON(event){

    const file =
    event.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload = function(e){

        data =
        JSON.parse(
            e.target.result
        );

        save();

        render();

        alert(
            "Sauvegarde restaurée"
        );

    };

    reader.readAsText(file);

}
function setQtyByCode(code,valeur){

const article =
data[currentTab].find(
a => String(a.code) === String(code)
);

if(!article) return;

article.quantite =
valeur === ""
? 0
: parseInt(valeur) || 0;

save();

}

function render(){

const search =
document.getElementById("search")
.value
.toLowerCase();

let html = "";

if(currentTab === "resume"){

    const categories = [

        {
            nom:"DEVANT BAR",
            data:data.devant
        },

        {
            nom:"ARRIERE BAR CHAMPAGNE",
            data:data.champagne
        },

        {
            nom:"ARRIERE BAR ALCOOL",
            data:data.alcool
        }

    ];

    let totalGlobal = 0;
    let nbArticlesGlobal = 0;

    categories.forEach(cat => {

        const articles =
        cat.data.filter(
            item =>
            Number(item.quantite) > 0
        );

        if(articles.length === 0)
            return;

        const totalCategorie =
        articles.reduce(
            (s,a)=>s+Number(a.quantite),
            0
        );

        totalGlobal += totalCategorie;
        nbArticlesGlobal += articles.length;

        html += `
        <div class="card">

        <h2>${cat.nom}</h2>

        <p>
        ${articles.length} article(s)
        /
        ${totalCategorie} unité(s)
        </p>
        `;

        articles.forEach(item => {

            html += `
            <div style="
            display:flex;
            justify-content:space-between;
            padding:6px 0;
            border-bottom:1px solid #eee;
            ">

                <span>
                ${item.article}
                </span>

                <strong>
                ${item.quantite}
                </strong>

            </div>
            `;

        });

        html += `</div>`;

    });

    html += `
    <div class="card">

        <h2>TOTAL GÉNÉRAL</h2>

        <p>
        ${nbArticlesGlobal}
        article(s)
        </p>

        <p>
        ${totalGlobal}
        unité(s)
        </p>

    </div>
    `;

}
else{

    data[currentTab]

    .filter(item =>
        item.article &&
        item.article
        .toLowerCase()
        .includes(search)
    )

    .forEach((item,index)=>{

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
                class="qtyInput"
                id="qty_${item.code}"
                type="number"
                value="${
                    item.quantite === 0
                    ? ''
                    : item.quantite
                }">

                <button
                class="edit"
                onclick="validerQuantite('${item.code}')">
                OK
                </button>

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

}

document.getElementById("cards")
.innerHTML = html;

}
function validerQuantite(code){

    const input =
    document.getElementById(
        "qty_" + code
    );

    const article =
    data[currentTab].find(
        a => String(a.code) === String(code)
    );

    if(!article) return;

    article.quantite =
    input.value === ""
    ? 0
    : parseInt(input.value);

save();

const recherche =
document.getElementById("search");

recherche.value = "";

render();

setTimeout(() => {

    document
    .getElementById("search")
    .focus();

}, 100);



}
function addArticle(){

const code =
prompt("Code article");

if(!code) return;

const article =
prompt("Nom article");

if(!article) return;

data[currentTab].push({

code:code,
article:article,
quantite:0

});

save();
render();

}

function editArticle(index){

const item =
data[currentTab][index];

item.code =
prompt(
"Code",
item.code
) || item.code;

item.article =
prompt(
"Article",
item.article
) || item.article;

save();
render();

}

function deleteArticle(index){

if(!confirm(
"Supprimer cet article ?"
)) return;

data[currentTab]
.splice(index,1);

save();
render();

}

function resetStock(){

if(!confirm(
"Remettre toutes les quantités à zéro ?"
)) return;

Object.keys(data)
.forEach(cat=>{

data[cat]
.forEach(item=>{

item.quantite = 0;

});

});

save();
render();

}

function exportExcel(){

const wb =
XLSX.utils.book_new();

function addSheet(
nom,
donnees
){

const ws =
XLSX.utils.json_to_sheet(
donnees
);

XLSX.utils.book_append_sheet(
wb,
ws,
nom
);

}

addSheet(
"DEVANT BAR",
data.devant
);

addSheet(
"ARRIERE BAR CHAMPAGNE",
data.champagne
);

addSheet(
"ARRIERE BAR ALCOOL",
data.alcool
);

const maintenant = new Date();

const fichier =
"remontee-de-cave-" +
maintenant.getFullYear() + "-" +
String(maintenant.getMonth() + 1).padStart(2,"0") + "-" +
String(maintenant.getDate()).padStart(2,"0") + "-" +
String(maintenant.getHours()).padStart(2,"0") + "h" +
String(maintenant.getMinutes()).padStart(2,"0") +
".xlsx";

XLSX.writeFile(
    wb,
    fichier
);

}

function importExcel(event){

    const file = event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        const workbook =
        XLSX.read(
            e.target.result,
            {type:"array"}
        );

        let imported = {
            devant: [],
            champagne: [],
            alcool: []
        };

        function lireFeuille(
            nomFeuille,
            destination
        ){

            const sheet =
            workbook.Sheets[nomFeuille];

            if(!sheet) return;

            const rows =
            XLSX.utils.sheet_to_json(sheet);

            rows.forEach(row => {

                destination.push({

                    code:
                        row.code ||
                        row.CODE ||
                        row.Code ||
                        "",

                    article:
                        row.article ||
                        row.ARTICLE ||
                        row.Article ||
                        "",

                    quantite:
                        Number(
                            row.quantite ||
                            row.QUANTITE ||
                            row.Quantite ||
                            0
                        )

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

     alert(
    "DEVANT BAR : " + imported.devant.length +
    "\nCHAMPAGNE : " + imported.champagne.length +
    "\nALCOOL : " + imported.alcool.length
);

    };

     reader.readAsArrayBuffer(file);

}

render();
