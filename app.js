let data =
JSON.parse(localStorage.getItem("caveData")) || {

    devant: [],
    champagne: [],
    alcool: []

};

Object.keys(data).forEach(categorie => {

    data[categorie].forEach(item => {

        if(!item.id){

            item.id = crypto.randomUUID();

        }

    });

});

save();

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
alert("Lecture du fichier");
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
function toggleCheck(id){

    let article = null;

    [
        ...data.devant,
        ...data.champagne,
        ...data.alcool
    ].forEach(a => {

        if(String(a.id) === String(id)){
            article = a;
        }

    });

    if(!article) return;

    article.coche =
    !article.coche;

    save();

    render();

}
function render(){

const search =
document.getElementById("search")
.value
.toLowerCase();
const zoneOnglets =
document.getElementById("zoneOnglets");

const toolbar =
document.getElementById("toolbarActions");
    const titre =
document.getElementById("titreApp");

if(search.trim() !== ""){
    titre.style.display = "none";

    zoneOnglets.style.display = "none";

    toolbar.querySelectorAll("button")
    .forEach(btn => {

        if(
            !btn.textContent.includes("Ajouter")
        ){
            btn.style.display = "none";
        }

    });

}
else{

    titre.style.display = "";
    
    zoneOnglets.style.display = "flex";

    toolbar.querySelectorAll("button")
    .forEach(btn => {

        btn.style.display = "";

    });

}
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
    <div class="${
        item.coche ? 'resumeOk' : ''
    }"

    style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:8px;
    border-bottom:1px solid #eee;
    ">

        <div>

            <label>

            <input
            type="checkbox"
            ${item.coche ? "checked" : ""}
         onchange="toggleCheck('${item.id}')">

            <strong>${item.code || "SANS CODE"}</strong>
            - ${item.article}

            </label>

        </div>

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
id="qty_${item.id}"
type="number"
enterkeyhint="go"
value="${item.quantite === 0 ? '' : item.quantite}"
onkeydown="if(event.key==='Enter'){validerQuantite('${item.id}');}">

                <button
                class="edit"
              onclick="validerQuantite('${item.id}')">
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
               onclick="deleteArticle('${item.id}')">
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
function validerQuantite(id){

    const input =
    document.getElementById(
        "qty_" + id
    );

    const article =
    data[currentTab].find(
        a => String(a.id) === String(id)
    );

    if(!article) return;

    article.quantite =
    input.value === ""
    ? 0
    : parseInt(input.value) || 0;

    save();

    render();

    setTimeout(() => {

        const recherche =
        document.getElementById("search");

        recherche.value = "";
        recherche.focus();

    }, 50);

}
function addArticle(){

if(currentTab === "resume"){

    alert(
    "Choisissez une catégorie avant d'ajouter un article."
    );

    return;

}

const code =
prompt("Code article");

if(code === null) return;

const article =
prompt("Nom article");

if(!article) return;

data[currentTab].push({

id: crypto.randomUUID(),

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

function deleteArticle(id){

    data[currentTab] =
    data[currentTab].filter(
        item => item.id !== id
    );

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

    alert("ETAPE 1");

    const file = event.target.files[0];

    if(!file){
        alert("PAS DE FICHIER");
        return;
    }

    alert("ETAPE 2 : " + file.name);

    const reader = new FileReader();

    reader.onload = function(e){

        alert("ETAPE 3");

    };

    reader.readAsArrayBuffer(file);

}
render();
