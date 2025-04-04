// ==============================
// 1. Inicialização da Cena
// ==============================
let scene, camera, renderer, controls, raycaster, mouse;
let objetos = [], objetoSelecionado = null;
let modoEdicao = true;
let luz; // 🔴 agora a luz é global!


function iniciarCena() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 20, 30);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;


}


function iniciarCena() {
    // Criando a cena principal do Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Define o fundo da cena como azul (cor do céu)

    // Criando a câmera
    camera = new THREE.PerspectiveCamera(
        75, // Campo de visão (FOV)
        window.innerWidth / window.innerHeight, // Proporção da tela
        0.1, // Distância mínima de renderização
        1000 // Distância máxima de renderização
    );
    camera.position.set(10, 20, 30); // Define a posição inicial da câmera

    // Criando o renderizador WebGL
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight); // Define o tamanho do renderizador igual à tela
    document.body.appendChild(renderer.domElement); // Adiciona o renderizador ao HTML

    // Adicionando controles de câmera (permite girar, zoom, etc.)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Suaviza os movimentos

    // Criando Raycaster para interações com objetos 3D
    raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2(); // Vetor que armazena a posição do mouse
    let bolinha; // Variável global para armazenar a bolinha

    // Função para criar a bolinha vermelha que segue o mouse
    function criarBolinha() {
        let geometria = new THREE.SphereGeometry(0.2, 16, 16); // Cria uma esfera pequena
        let material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Define a cor vermelha
        bolinha = new THREE.Mesh(geometria, material); // Cria o objeto 3D (malha)
        scene.add(bolinha); // Adiciona a bolinha à cena
    }

    // Função que faz a bolinha seguir o mouse na tela
    function atualizarBolinha(event) {
        if (!bolinha) return; // Se a bolinha não existir, não faz nada

        // Normaliza as coordenadas do mouse (-1 a 1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Converte a posição do mouse para coordenadas 3D
        let vetor3D = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vetor3D.unproject(camera); // Converte para coordenadas do mundo 3D

        let dir = vetor3D.sub(camera.position).normalize(); // Direção do mouse no mundo 3D
        let distancia = -camera.position.z / dir.z; // Calcula a distância correta no espaço
        let novaPosicao = camera.position.clone().add(dir.multiplyScalar(distancia));

        bolinha.position.copy(novaPosicao); // Atualiza a posição da bolinha
    }

    // Criar a bolinha ao iniciar a cena
    criarBolinha();

    // Adicionar evento de movimento do mouse para atualizar a bolinha
    window.addEventListener("mousemove", atualizarBolinha);

    // Criando uma luz direcional para iluminar a cena
      // Dentro da função iniciarCena()
luz = new THREE.DirectionalLight(0xffffff, 1);
luz.position.set(10, 20, 30);
scene.add(luz);
    animate();
    // Adiciona uma grade inicial ao cenário
    adicionarGrade(200, 50, 0, 0, 0);

    // Eventos do mouse e tela
    window.addEventListener("mousedown", selecionarObjeto); // Evento de clique no mouse
    window.addEventListener("resize", ajustarTela); // Evento para ajustar o tamanho ao redimensionar a janela

    // Função de animação que mantém a cena atualizada
    function animate() {
        requestAnimationFrame(animate); // Chama a função continuamente para atualizar a cena
        renderer.render(scene, camera); // Renderiza a cena com a câmera
    }

    animate(); // Inicia a animação
}

// Função para adicionar uma grade ao cenário
function adicionarGrade(tamanho, escala, x, y, z) {
    let grid = new THREE.GridHelper(tamanho, escala); // Cria a grade
    grid.name = "gridHelper"; // Define um nome para facilitar sua remoção posterior
    grid.position.set(x, y, z); // Define a posição da grade
    scene.add(grid); // Adiciona a grade à cena
}

function atualizarLuz() {
    if (!luz) {
        console.error("A luz ainda não foi criada!");
        return;
    }

    let novaCor = document.getElementById("corLuz").value;
    let novaIntensidade = parseFloat(document.getElementById("intensidadeLuz").value);
    let posX = parseFloat(document.getElementById("posX").value);
    let posY = parseFloat(document.getElementById("posY").value);
    let posZ = parseFloat(document.getElementById("posZ").value);

    luz.color.set(novaCor);
    luz.intensity = novaIntensidade;
    luz.position.set(posX, posY, posZ);
}


// Função para atualizar a grade dinamicamente
function atualizarGrade() {
    // Obtém os valores dos inputs do HTML para a grade
    let tamanho = parseFloat(document.getElementById("gridSize").value);
    let escala = parseFloat(document.getElementById("escalaGrid").value);
    let x = parseFloat(document.getElementById("gridX").value);
    let y = parseFloat(document.getElementById("gridY").value);
    let z = parseFloat(document.getElementById("gridZ").value);

    // Verifica se os valores são válidos
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
    if (!mouse) return; // Evita erros caso mouse não esteja definido

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// ==============================
// 3. Selecionar um Objeto na Cena
// ==============================
function selecionarObjeto(event) {
    if (!modoEdicao) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersecoes = raycaster.intersectObjects(objetos, true);

    if (intersecoes.length > 0) {
        objetoSelecionado = intersecoes[0].object;

        // Exibir o painel e preencher os valores
        document.getElementById("editPanel").style.display = "block";
        document.getElementById("posX").value = objetoSelecionado.position.x;
        document.getElementById("posY").value = objetoSelecionado.position.y;
        document.getElementById("posZ").value = objetoSelecionado.position.z;
        document.getElementById("escalaObjeto").value = objetoSelecionado.scale.x;
        document.getElementById("corObjeto").value = "#" + objetoSelecionado.material.color.getHexString();
    } else {
        objetoSelecionado = null;
        document.getElementById("editPanel").style.display = "none";
    }
}


function selecionarObjeto(event) {
    if (!modoEdicao) return;

    // Atualiza as coordenadas do mouse (normalizadas entre -1 e 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Atualiza o Raycaster
    raycaster.setFromCamera(mouse, camera);

    // Interseção com os objetos na cena
    let intersecoes = raycaster.intersectObjects(objetos, true);

    console.log("Coordenadas do mouse:", mouse);
    console.log("Objetos na cena:", objetos.length);
    console.log("Objetos detectados:", intersecoes);

    if (intersecoes.length > 0) {
        let novoObjetoSelecionado = intersecoes[0].object;

        // Evita re-selecionar o mesmo objeto
        if (objetoSelecionado === novoObjetoSelecionado) return;

        // Remove o destaque do objeto anterior
        if (objetoSelecionado) {
            objetoSelecionado.material.emissive.set(0x000000);
        }

        // Atualiza o objeto selecionado
        objetoSelecionado = novoObjetoSelecionado;
        objetoSelecionado.material.emissive.set(0x333333); // Destaque

        console.log("Objeto selecionado:", objetoSelecionado);
        atualizarPainelObjeto();
    } else {
        // Se clicar no vazio, remover seleção
        if (objetoSelecionado) {
            objetoSelecionado.material.emissive.set(0x000000);
        }
        console.log("Nenhum objeto detectado!");
        objetoSelecionado = null;
        atualizarPainelObjeto();
    }
}

function selecionarObjeto(objeto) {
    console.log(objeto); // Verifica se a variável existe
    if (!objeto) {
        console.error("Objeto não definido!");
        return; // Sai da função para evitar o erro
    }

    objeto.x = 100; // Definir a propriedade somente se o objeto for válido
}


function aplicarEdicao() {
    if (objetoSelecionado) {
        let novaPosX = parseFloat(document.getElementById("posX").value);
        let novaPosY = parseFloat(document.getElementById("posY").value);
        let novaPosZ = parseFloat(document.getElementById("posZ").value);
        let novaEscala = parseFloat(document.getElementById("escalaObjeto").value);
        let novaCor = document.getElementById("corObjeto").value;

        objetoSelecionado.position.set(novaPosX, novaPosY, novaPosZ);
        objetoSelecionado.scale.set(novaEscala, novaEscala, novaEscala);
        objetoSelecionado.material.color.set(novaCor);
    }
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
    atualizarListaObjetos();
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
// 📌 Variáveis globais
// ==============================


// ==============================
// 🎯 Função para adicionar objeto
// ==============================
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

// ==============================
// 🔄 Atualiza a lista de objetos
// ==============================
function atualizarListaObjetos() {
    let painel = document.getElementById("objectListContent");
    painel.innerHTML = ""; // Limpa a lista

    if (objetos.length === 0) {
        painel.innerHTML = "<p>Nenhum objeto adicionado ainda.</p>";
        return;
    }

    objetos.forEach((obj, index) => {
        let item = document.createElement("div");
        item.classList.add("object-item");

        let nome = document.createElement("span");
        nome.textContent = `🔹 Objeto ${index + 1}`;
        nome.onclick = () => selecionarObjetoLista(obj);

        let btnRemover = document.createElement("button");
        btnRemover.textContent = "❌";
        btnRemover.onclick = () => removerObjeto(index);

        item.appendChild(nome);
        item.appendChild(btnRemover);
        painel.appendChild(item);
    });
}

// ==============================
// 🎯 Função para remover um objeto
// ==============================
function removerObjeto(index) {
    if (index >= 0 && index < objetos.length) {
        // Remove da cena e do array
        scene.remove(objetos[index]);
        objetos.splice(index, 1);

        // Se o objeto removido for o selecionado, limpa a seleção
        if (objetoSelecionado && objetoSelecionado === objetos[index]) {
            objetoSelecionado = null;
            atualizarPainelObjeto();
        }

        atualizarListaObjetos();
    }
}

// ==============================
// ✋ Selecionar objeto na lista
// ==============================
function selecionarObjetoLista(obj) {
    if (objetoSelecionado) {
        objetoSelecionado.material.emissive.set(0x000000); // Remove destaque do anterior
    }

    objetoSelecionado = obj;
    objetoSelecionado.material.emissive.set(0x333333); // Destaque no novo objeto

    atualizarPainelObjeto();
}

// ==============================
// 📌 Atualiza painel de propriedades
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

// ==============================
// 🎯 Função para deletar objeto selecionado
// ==============================
function deletarObjeto() {
    if (objetoSelecionado) {
        let index = objetos.indexOf(objetoSelecionado);
        if (index > -1) {
            scene.remove(objetoSelecionado);
            objetos.splice(index, 1);
        }

        objetoSelecionado = null;
        atualizarPainelObjeto();
        atualizarListaObjetos();
    }
}

// ==============================
// 🖱️ Detectar clique e selecionar objeto
// ==============================

function selecionarObjeto(event) {
    if (!modoEdicao) return;

    // Normaliza as coordenadas do mouse (-1 a 1)
    let mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Dispara o Raycaster
    raycaster.setFromCamera(mouse, camera);

    if (objetos.length === 0) {
        console.warn("Nenhum objeto para seleção.");
        return;
    }

    let intersecoes = raycaster.intersectObjects(objetos, true);

    if (intersecoes.length > 0) {
        let novoObjetoSelecionado = intersecoes[0].object;

        if (objetoSelecionado === novoObjetoSelecionado) return;

        // Remove o brilho do objeto anterior
        if (objetoSelecionado) {
            objetoSelecionado.material.emissive.setHex(0x000000);
        }

        // Seleciona e destaca o novo objeto
        objetoSelecionado = novoObjetoSelecionado;
        objetoSelecionado.material.emissive.setHex(0x333333);

        console.log("Objeto selecionado:", objetoSelecionado);
        atualizarPainelObjeto();
    } else {
        // Remove a seleção ao clicar no vazio
        if (objetoSelecionado) {
            objetoSelecionado.material.emissive.setHex(0x000000);
        }
        objetoSelecionado = null;
        atualizarPainelObjeto();
    }
}




// ==============================
// 🎯 Adicionar evento de clique na tela
// ==============================
window.addEventListener("click", selecionarObjeto);
