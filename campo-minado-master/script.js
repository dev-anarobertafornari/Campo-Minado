var jogador;
var linhas;
var colunas;
var numBombas;
var campo;
var semBomba;
var totalCelulas;
var cronometro;
var partida;

// Cronômetro

function iniciarTempo() {
	clearInterval(cronometro);

	cronometro = setInterval(function () {
		if (partida) {
			var tempoAtual = document.getElementById("tempo").innerHTML.split(":");

			var min = parseInt(tempoAtual[0]);
			var seg = parseInt(tempoAtual[1]);

			seg++;
			if (seg === 60) {
				seg = 0;
				min++;
			}

			if (min < 10) min = "0" + min;
			if (seg < 10) seg = "0" + seg;

			document.getElementById("tempo").innerHTML = min + ":" + seg;
		}
	}, 1000);
}

// Limpar Tabuleiro

function limpar() {
	var t = document.getElementById("tabela");
	if (t) t.remove();
}

// Para Inicializar Células

function inicializarCelulas() {
	campo = [];
	semBomba = [];

	for (var i = 0; i < linhas; i++) {
		campo[i] = [];
		for (var j = 0; j < colunas; j++) {
			var celula = {
				valor: 0,
				estado: false,
				linha: i,
				coluna: j
			};
			campo[i][j] = celula;
			semBomba.push(celula);
		}
	}

	for (var i = 0; i < numBombas; i++) {
		var indice = Math.floor(Math.random() * semBomba.length);
		var bomba = semBomba.splice(indice, 1)[0];
		campo[bomba.linha][bomba.coluna].valor = -1;
	}

	for (var i = 0; i < linhas; i++) {
		for (var j = 0; j < colunas; j++) {
			if (campo[i][j].valor !== -1) {
				var totalBombas = 0;
				var coord = [
					[i + 1, j - 1], [i, j - 1], [i - 1, j - 1],
					[i - 1, j], [i - 1, j + 1], [i, j + 1],
					[i + 1, j + 1], [i + 1, j]
				];

				for (var k = 0; k < coord.length; k++) {
					var x = coord[k][0];
					var y = coord[k][1];
					if (x >= 0 && y >= 0 && x < linhas && y < colunas) {
						if (campo[x][y].valor === -1) totalBombas++;
					}
				}
				campo[i][j].valor = totalBombas;
			}
		}
	}
}

// Iniciar Novo Jogo

function novoJogo(n, x, y, b) {
	if (x * y < b) {
		alert("Número de bombas maior que o número de células!");
		return;
	}

	limpar();

	jogador = n;
	linhas = x;
	colunas = y;
	numBombas = b;
	totalCelulas = 0;
	partida = false;

	clearInterval(cronometro);
	document.getElementById("tempo").innerHTML = "00:00";

	inicializarCelulas();

	var tabela = document.createElement("table");
	tabela.id = "tabela";

	for (var i = 0; i < linhas; i++) {
		var tr = document.createElement("tr");

		for (var j = 0; j < colunas; j++) {
			var td = document.createElement("td");
			td.id = i + "-" + j;
			td.onclick = function () {
				clickCelula(this.id);
				if (!partida) {
					partida = true;
					iniciarTempo();
				}
			};

			if (campo[i][j].valor !== 0) {
				var img = document.createElement("img");
				img.src = "imagens/" + campo[i][j].valor + ".png";
				img.id = "i" + i + "-" + j;
				img.style.visibility = "hidden";
				td.appendChild(img);
			}

			tr.appendChild(td);
		}
		tabela.appendChild(tr);
	}

	document.getElementById("campo").appendChild(tabela);
	atualizarRestantes();
}

// Clicar na Célula

function clickCelula(id) {
	var p = id.split("-");
	var i = parseInt(p[0]);
	var j = parseInt(p[1]);

	if (!partida) {
		partida = true;
		iniciarTempo();
	}

	if (!campo[i][j].estado) {
		verificarCelula(i, j);
	}
}

// Verificar Célula

function verificarCelula(i, j) {
	if (campo[i][j].estado) return;

	abrirCelula(i, j);
	campo[i][j].estado = true;
	totalCelulas++;

	if (campo[i][j].valor === 0) {
		var coord = [
			[i + 1, j - 1], [i, j - 1], [i - 1, j - 1],
			[i - 1, j], [i - 1, j + 1], [i, j + 1],
			[i + 1, j + 1], [i + 1, j]
		];

		for (var k = 0; k < coord.length; k++) {
			var x = coord[k][0];
			var y = coord[k][1];
			if (x >= 0 && y >= 0 && x < linhas && y < colunas) {
				verificarCelula(x, y);
			}
		}
	}

	if (campo[i][j].valor === -1) {
		fimDeJogo(false);
    }

	if (totalCelulas === (linhas * colunas - numBombas)) {
		fimDeJogo(true);
	}

	atualizarRestantes();
}

// Para abrir a Célula

function abrirCelula(i, j) {
	var td = document.getElementById(i + "-" + j);

	if (campo[i][j].valor !== 0) {
		var img = document.getElementById("i" + i + "-" + j);
		if (img) img.style.visibility = "visible";
	}

	td.style.background =
		campo[i][j].valor === -1 ? "red" :
		campo[i][j].valor === 0 ? "#9cbae3ff" :
		"rgba(143, 183, 215, 1)";
}

function atualizarRestantes() {
	document.getElementById("restantes").innerHTML =
		(linhas * colunas - numBombas - totalCelulas) +
		"/" + (linhas * colunas - numBombas);
}

// Fim de Jogo

function fimDeJogo(vitoria) {
	partida = false;
	clearInterval(cronometro);

	for (var i = 0; i < linhas; i++) {
		for (var j = 0; j < colunas; j++) {
			var td = document.getElementById(i + "-" + j);
			td.onclick = function () {
				alert("Fim de jogo! Inicie uma nova partida.");
			};
			if (!vitoria && campo[i][j].valor === -1) abrirCelula(i, j);
		}
	}

	registrarHistorico(vitoria);
	alert("Fim de jogo! " + (vitoria ? "Vitória 🎉" : "Derrota 💥"));
}

// Histórico

function registrarHistorico(vitoria) {
	var hist = document.createElement("div");
	hist.style.border = "1px solid black";
	hist.style.borderRadius = "20px";
	hist.style.margin = "20px auto";
	hist.style.width = "30%";

	hist.innerHTML = `
		<p><strong>Jogador:</strong> ${jogador}</p>
		<p><strong>Dimensões:</strong> ${linhas}x${colunas}</p>
		<p><strong>Bombas:</strong> ${numBombas}</p>
		<p><strong>Tempo:</strong> ${document.getElementById("tempo").innerHTML}</p>
		<p><strong>Células abertas:</strong> ${totalCelulas}</p>
		<p><strong>Resultado:</strong>
			<span style="color:${vitoria ? "green" : "red"}; font-weight:bold">
				${vitoria ? "Vitória" : "Derrota"}
			</span>
		</p>
	`;

	document.getElementById("registros").prepend(hist);
}
 // Para mostrar onde estão as bombas

function mostrar() {
	if (!campo) return;

	clearInterval(cronometro);

	for (var i = 0; i < linhas; i++) {
		for (var j = 0; j < colunas; j++) {
			if (campo[i][j].valor !== 0) {
				var img = document.getElementById("i" + i + "-" + j);
				if (img) img.style.visibility = "visible";
			}

			var td = document.getElementById(i + "-" + j);
			td.style.background =
				campo[i][j].valor === -1 ? "red" :
				campo[i][j].valor === 0 ? "#9cbae3ff" :
				"rgba(143, 183, 215, 1)";
		}
	}
}

// Restaurar jogo já iniciado

function restaurar() {
	if (!campo) return;

	partida = false;
	clearInterval(cronometro);
	totalCelulas = 0;

	for (var i = 0; i < linhas; i++) {
		for (var j = 0; j < colunas; j++) {

			campo[i][j].estado = false;

			var td = document.getElementById(i + "-" + j);
			td.style.background = "";
			var img = document.getElementById("i" + i + "-" + j);
			if (img) img.style.visibility = "hidden";
		}
	}

	atualizarRestantes();gfc 
}

