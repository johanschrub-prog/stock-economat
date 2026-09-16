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
value="${item.quantite === 0 ? '' : item.quantite}">
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

    recherche.focus();

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

XLSX.writeFile(
wb,
"REMONTEE_DE_CAVE.xlsx"
);

}

render();
