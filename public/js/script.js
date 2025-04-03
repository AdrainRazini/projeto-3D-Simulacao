// ==============================
// 1. Inicialização da Cena
// ==============================
let scene, camera, renderer, controls, raycaster, mouse;
let objetos = [], objetoSelecionado = null;
let modoEdicao = true;



function iniciarCena() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 20, 30);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    let luz = new THREE.DirectionalLight(0xffffff, 1);
    luz.position.set(10, 20, 30);
    scene.add(luz);

    // Adiciona a grade inicial (200x50) na posição (0,0,0)
    adicionarGrade(200, 50, 0, 0, 0);

    // Event Listeners
    window.addEventListener("mousedown", selecionarObjeto);
    window.addEventListener("mousemove", atualizarPosicaoMouse);
    window.addEventListener("resize", ajustarTela);

    animate();
}

// Função para criar e adicionar uma grade à cena
function adicionarGrade(tamanho, escala, x, y, z) {
    let grid = new THREE.GridHelper(tamanho, escala);
    grid.name = "gridHelper";
    grid.position.set(x, y, z);
    scene.add(grid);
}

// Função para atualizar a grade dinamicamente
function atualizarGrade() {
    let tamanho = parseFloat(document.getElementById("gridSize").value);
    let escala = parseFloat(document.getElementById("escalaGrid").value);
    let x = parseFloat(document.getElementById("gridX").value);
    let y = parseFloat(document.getElementById("gridY").value);
    let z = parseFloat(document.getElementById("gridZ").value);

    if (isNaN(tamanho) || tamanho < 10 || isNaN(escala) || escala < 1) {
        alert("Insira valores válidos para a grade!");
        return;
    }

    // Remove a grade antiga, se existir
    let gridAntigo = scene.getObjectByName("gridHelper");
    if (gridAntigo) {
        scene.remove(gridAntigo);
    }

    // Adiciona a nova grade com os valores ajustados
    adicionarGrade(tamanho, escala, x, y, z);
}



// ==============================
// 2. Atualizar posição do mouse
// ==============================
function atualizarPosicaoMouse(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// ==============================
// 3. Selecionar um Objeto na Cena
// ==============================
function selecionarObjeto(event) {
    if (!modoEdicao) return;

    // Atualizar posição do mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Definir o raycaster
    raycaster.setFromCamera(mouse, camera);
    raycaster.layers.set(0); // Apenas detectar objetos, não a grade

    let intersecoes = raycaster.intersectObjects(objetos, true);

    console.log("Total de objetos na cena:", objetos.length);
    console.log("Objetos detectados pelo Raycaster:", intersecoes.length);

    if (intersecoes.length > 0) {
        objetoSelecionado = intersecoes[0].object;
        console.log("Objeto selecionado:", objetoSelecionado);
        atualizarPainelObjeto();
    } else {
        console.log("Nenhum objeto detectado!");
        objetoSelecionado = null;
        atualizarPainelObjeto();
    }
}

function adicionarObjeto(tipo) {
    let escala = parseFloat(document.getElementById('escala').value) || 1;
    let cor = document.getElementById('cor').value || 0xffffff;
    let geometria;

    if (tipo === "cubo") {
        geometria = new THREE.BoxGeometry(escala, escala, escala);
    } else if (tipo === "esfera") {
        geometria = new THREE.SphereGeometry(escala / 2, 32, 32);
    } else if (tipo === "cilindro") {
        geometria = new THREE.CylinderGeometry(escala / 2, escala / 2, escala, 32);
    }

    let material = new THREE.MeshStandardMaterial({ color: cor });
    let objeto = new THREE.Mesh(geometria, material);
    objeto.position.set(0, escala / 2, 0);
    
    // Importante para raycasting
    geometria.computeBoundingSphere();
    geometria.computeBoundingBox();
    objeto.geometry.boundingSphere = geometria.boundingSphere;
    objeto.geometry.boundingBox = geometria.boundingBox;

    scene.add(objeto);
    objetos.push(objeto);

    console.log("Novo objeto adicionado:", objeto);
}


// ==============================
// 4. Adicionar Objetos à Cena
// ==============================
function adicionarObjeto(tipo) {
    let escala = parseFloat(document.getElementById('escala').value);
    let cor = document.getElementById('cor').value;
    let geometria;

    if (tipo === "cubo") {
        geometria = new THREE.BoxGeometry(escala, escala, escala);
    } else if (tipo === "esfera") {
        geometria = new THREE.SphereGeometry(escala / 2, 32, 32);
    } else if (tipo === "cilindro") {
        geometria = new THREE.CylinderGeometry(escala / 2, escala / 2, escala, 32);
    }

    let material = new THREE.MeshStandardMaterial({ color: cor });
    let objeto = new THREE.Mesh(geometria, material);
    objeto.position.set(0, escala / 2, 0);

    // Computar bounding box para garantir que o Raycaster detecte corretamente
    geometria.computeBoundingBox();
    objeto.geometry.boundingBox = geometria.boundingBox;

    scene.add(objeto);
    objetos.push(objeto);

    console.log("Objeto adicionado:", objeto); // Depuração
}

// ==============================
// 5. Atualizar Painel de Propriedades
// ==============================
function atualizarPainelObjeto() {
    const painel = document.getElementById("propertiesPanel");
    const info = document.getElementById("prop-text");

    if (objetoSelecionado) {
        painel.style.display = "block";
        info.innerHTML = `
            <strong>Tipo:</strong> ${objetoSelecionado.geometry.type} <br>
            <strong>Cor:</strong> ${objetoSelecionado.material.color.getStyle()} <br>
            <strong>Escala:</strong> ${objetoSelecionado.scale.x} <br>
            <strong>Posição:</strong> (${objetoSelecionado.position.x.toFixed(2)}, 
                                       ${objetoSelecionado.position.y.toFixed(2)}, 
                                       ${objetoSelecionado.position.z.toFixed(2)})
        `;
    } else {
        painel.style.display = "node";
    }
}

// ==============================
// 6. Limpar a Cena
// ==============================
function limparCena() {
    objetos.forEach(obj => scene.remove(obj));
    objetos = [];
}




// ==============================
// 7. Girar Objeto Selecionado
// ==============================


function girarObjeto() {
    if (objetoSelecionado) {
        objetoSelecionado.rotation.y += Math.PI / 12; // Gira um pouco menos por vez
    }
}

// ==============================
// 8. Alternar Modo de Edição
// ==============================
function alternarEdicao() {
    modoEdicao = !modoEdicao;
    alert(modoEdicao ? "Modo de edição ativado" : "Modo de visualização ativado");
}

// ==============================
// 9. Ajustar Tela ao Redimensionar
// ==============================
function ajustarTela() {
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}


// ==============================
// 10. Animação Contínua da Cena
// ==============================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// ==============================
// 11. Iniciar a Cena
// ==============================
iniciarCena();


// ==============================
// 12. Propriedades obj
// ==============================


// ==============================
// Atualiza a lista de objetos no painel
// ==============================
function atualizarListaObjetos() {
    let painel = document.getElementById("objectListContent");
    painel.innerHTML = ""; // Limpa a lista

    if (objetos.length === 0) {
        painel.innerHTML = "<p>Nenhum objeto adicionado ainda.</p>";
        return;
    }

    objetos.forEach((obj, index) => {
        let item = document.createElement("p");
        item.textContent = `🔹 Objeto ${index + 1}`;
        item.onclick = () => selecionarObjetoLista(obj);
        painel.appendChild(item);
    });
}
function removerObjeto(index) {
    if (index >= 0 && index < objetos.length) {
        scene.remove(objetos[index]); // Remove da cena
        objetos.splice(index, 1); // Remove da lista
        atualizarListaObjetos(); // Atualiza a lista
        atualizarPainelObjeto(); // Atualiza o painel de propriedades
    }
}

// ==============================
// Seleciona um objeto ao clicar na lista
// ==============================
function selecionarObjetoLista(obj) {
    objetoSelecionado = obj;
    atualizarPainelObjeto();
}
// ==============================
// Atualiza o painel de propriedades
// ==============================
function atualizarPainelObjeto() {
    let painel = document.getElementById("selectedObjectPanel");
    let info = document.getElementById("obj-info");

    if (objetoSelecionado) {
        painel.style.display = "block";

        let tipo = objetoSelecionado.geometry.type;
        let cor = objetoSelecionado.material.color.getStyle();
        let escala = objetoSelecionado.scale;
        let posicao = objetoSelecionado.position;
        let rotacao = objetoSelecionado.rotation;

        info.innerHTML = `
            📌 <strong>Objeto Selecionado</strong><br>
            🆔 <strong>ID:</strong> ${objetos.indexOf(objetoSelecionado)}<br>
            📦 <strong>Tipo:</strong> ${tipo}<br>
            🎨 <strong>Cor:</strong> ${cor}<br>
            📏 <strong>Escala:</strong> (X: ${escala.x.toFixed(2)}, Y: ${escala.y.toFixed(2)}, Z: ${escala.z.toFixed(2)})<br>
            📍 <strong>Posição:</strong> (X: ${posicao.x.toFixed(2)}, Y: ${posicao.y.toFixed(2)}, Z: ${posicao.z.toFixed(2)})<br>
            🔄 <strong>Rotação:</strong> (X: ${rotacao.x.toFixed(2)}, Y: ${rotacao.y.toFixed(2)}, Z: ${rotacao.z.toFixed(2)})<br>
        `;
    } else {
        painel.style.display = "none";
    }
}

// Função para deletar o objeto selecionado
function deletarObjeto() {
    if (objetoSelecionado) {
        // Remove da cena
        scene.remove(objetoSelecionado);
        
        // Remove do array de objetos
        let index = objetos.indexOf(objetoSelecionado);
        if (index > -1) {
            objetos.splice(index, 1);
        }

        // Reseta seleção
        objetoSelecionado = null;
        atualizarPainelObjeto();
    }
}


// Modifique a função adicionarObjeto para atualizar a lista sempre que um objeto for adicionado
function adicionarObjeto(tipo) {
    let escala = parseFloat(document.getElementById('escala')?.value) || 1;
    let cor = document.getElementById('cor')?.value || 0xffffff;
    let geometria;

    switch (tipo) {
        case "cubo":
            geometria = new THREE.BoxGeometry(escala, escala, escala);
            break;
        case "esfera":
            geometria = new THREE.SphereGeometry(escala / 2, 32, 32);
            break;
        case "cilindro":
            geometria = new THREE.CylinderGeometry(escala / 2, escala / 2, escala, 32);
            break;
        default:
            console.warn("Tipo de objeto não reconhecido:", tipo);
            return;
    }

    let material = new THREE.MeshStandardMaterial({ color: new THREE.Color(cor) });
    let objeto = new THREE.Mesh(geometria, material);
    objeto.position.set(0, escala / 2, 0);

    scene.add(objeto);
    objetos.push(objeto);

    atualizarListaObjetos();
}

