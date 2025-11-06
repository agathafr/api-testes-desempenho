# 🚀 API – Testes de Desempenho

Repositório criado para a prática de **Testes de Desempenho com k6**.  
O projeto executa uma **API FastAPI** que simula diferentes condições de carga e degradação (latência, erro, vazamento de memória e uso intensivo de CPU).  
Foram aplicados três cenários clássicos:  
**Carga Progressiva (Ramp-Up)**, **Pico Súbito (Spike)** e **Resistência (Endurance)**.

---

## 🧩 Estrutura do Projeto

```
api-testes-desempenho/
├─ src/
│  └─ main.py
├─ tests/
│  ├─ teste-carga.js
│  ├─ teste-spike.js
│  └─ teste-endurance.js
├─ results/
│  ├─ perf/
│  │  ├─ sumario.json
│  │  ├─ spike.json
│  │  └─ endurance.json
│  ├─ evidencias/
│  │  ├─ endpoint-status.png
│  │  ├─ status-endurance-inicial.png
│  │  ├─ status-endurance-final.png
│  │  ├─ terminal-sumario.png
│  │  ├─ terminal-spike.png
│  │  └─ terminal-endurance.png
│  └─ relatorio-testes-de-desempenho.md
├─ README.md
├─ requirements.txt
└─ .gitignore
```

---

## ⚙️ Configuração do Ambiente

### 🔹 Pré-requisitos
- **Python 3.10+**
- **PowerShell ou terminal equivalente**
- **k6** instalado (via Chocolatey ou instalador MSI)
- **Git** (opcional, para versionamento)

---

## 🧱 Instalação da API

1️⃣ Clone ou baixe o projeto:
```powershell
git clone https://github.com/<seu-usuario>/api-testes-desempenho.git
cd api-testes-desempenho
```

2️⃣ Crie o ambiente virtual:
```powershell
python -m venv venv
```

3️⃣ Ative o ambiente virtual:
```powershell
.\venv\Scripts\Activate.ps1
```

4️⃣ Instale as dependências:
```powershell
pip install -r requirements.txt
```

---

## ▶️ Executando a API

Inicie a aplicação:
```powershell
uvicorn src.main:app --reload --port 8000
```

Acesse no navegador:
- **Página inicial:** http://localhost:8000  
- **Swagger:** http://localhost:8000/docs  
- **Status da API:** http://localhost:8000/status  

---

## 🧪 Executando os Testes de Desempenho (k6)

Em outro terminal (com o k6 instalado):

```powershell
# Cenário 1 – Carga Progressiva
k6 run --summary-export=results\perf\sumario.json tests\teste-carga.js

# Cenário 2 – Pico Súbito
k6 run --summary-export=results\perf\spike.json tests\teste-spike.js

# Cenário 3 – Resistência (30 minutos)
k6 run --summary-export=results\perf\endurance.json tests\teste-endurance.js
```

Os resultados serão salvos na pasta `results/perf/` e exibidos no terminal.

---

## 📊 Métricas Principais

Os testes medem e correlacionam:
- **Tempo de resposta (médio, p90, p95, p99)**  
- **Throughput (requisições por segundo)**  
- **Taxa de erro (HTTP 4xx, 5xx, timeouts)**  
- **Uso de CPU e memória (via endpoint `/status`)**  
- **Evidências visuais (prints do terminal e status da API)**

---

## 📋 Relatório de Resultados

O arquivo [`results/relatorio-testes-de-desempenho.md`](results/relatorio-testes-de-desempenho.md) contém:
- A metodologia dos três cenários testados;
- Comparação das métricas observadas;
- Interpretação dos resultados;
- Conclusão final e recomendações de melhoria.

### Resumo Final

| Cenário | Duração | VUs Máx. | p95 | Erros (%) | Observações |
|----------|----------|----------|-----|------------|--------------|
| Ramp-Up | ~3 min | 100 | 15,7 s | 31 % | Saturação progressiva |
| Spike | ~45 s | 200 | 45 s | 9 % | Pico súbito causa latência extrema |
| Endurance | 30 min | 50 | 34 s | 5 % | Mantém estabilidade, mas degrada ao longo do tempo |

---

## 📈 Recomendações Técnicas

- Implementar **cache** para endpoints repetitivos;  
- Revisar **funções CPU-bound** e otimizar loops;  
- Adotar **testes automatizados de performance** em pipeline CI/CD;  
- Monitorar **métricas de uso de CPU/memória** com alertas preventivos;  
- Usar **limite de conexões simultâneas** ou **fila de requisições**.

---

**Disciplina:** Testes de Integração e Api  
**Ferramentas:** Python, FastAPI, k6, PowerShell, VS Code  

---

📘 *“Medir é o primeiro passo para melhorar.”*
