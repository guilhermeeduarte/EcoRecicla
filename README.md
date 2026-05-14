
---


# ♻️ EcoRecicla - Sistema de Monitoramento de Resíduos e Reciclagem

Aplicação Full Stack (Java + React) desenvolvida para consultar e analisar dados reais sobre a geração de resíduos e taxas de reciclagem por município. Este projeto transforma dados brutos do SNIS (Sistema Nacional de Informações sobre Saneamento) em uma ferramenta de gestão ambiental para prefeituras e ONGs.


## 🛠️ Tecnologias Utilizadas

**Back-end:**
* Java 17+
* Spring Boot (Web, Data JPA)
* **Banco de Dados:** MySQL
* **Segurança:** Variáveis de ambiente (`.env`)
* OpenCSV (Leitura e carga de dados)

**Front-end:**
* React.js
* Axios (Consumo da API)
* CSS / Styled Components (Para o Dashboard)

---

## 📖 Dicionário de Dados

Abaixo está a explicação de cada atributo da entidade principal `RegistroResiduo`.

| Atributo | Tipo Java | Descrição |
| :--- | :--- | :--- |
| `id` | `Long` | Identificador único do registro (Chave Primária, Auto-incremento). |
| `municipio` | `String` | Nome da cidade/município referente aos dados coletados. |
| `estado` | `String` | Sigla ou nome do estado do município (ex: SP, RJ). |
| `quantidadeGerada` | `Double` | Quantidade total de resíduos gerados no município, em toneladas. |
| `taxaReciclagem` | `Double` | Percentual (%) do lixo gerado que foi efetivamente reciclado. |
| `ano` | `Integer` | Ano de referência da coleta dos dados. |

---

## 🗺️ Mapeamento de Rotas (API REST)

A API segue o padrão RESTful, retornando os status HTTP adequados (`200 OK`, `201 Created`, `404 Not Found`). URL Base: `http://localhost:8080/api/residuos`.

| Método | Rota | Descrição | Status de Sucesso |
| :--- | :--- | :--- | :--- |
| **POST** | `/carga-csv` | Lê o arquivo CSV e popula o banco de dados MySQL. | `201 Created` |
| **GET** | `/` | Retorna todos os registros cadastrados. | `200 OK` |
| **GET** | `/{id}` | Busca um registro específico pelo ID. | `200 OK` |
| **GET** | `/estado/{estado}` | Filtra registros por um estado específico. | `200 OK` |
| **GET** | `/taxa-abaixo/{meta}` | Municípios com reciclagem abaixo de uma meta determinada. | `200 OK` |
| **POST** | `/` | Cadastra um novo registro manualmente. | `201 Created` |
| **PUT** | `/{id}` | Atualiza os dados de um registro existente. | `200 OK` |
| **DELETE** | `/{id}` | Remove um registro do banco pelo ID. | `204 No Content` |

---

## 🧠 Justificativa Técnica: Uso do `Optional`

Na camada `Service`, utilizamos a interface `Optional` do Java ao realizar operações de busca no `Repository`. 

**Por que usamos?**
O uso do `Optional` encapsula o retorno de métodos que podem não encontrar resultados. Em vez de retornar `null`, o que poderia causar um `NullPointerException`, retornamos um objeto que "avisa" ao sistema se o valor está presente ou não. Isso permite que o código trate a ausência do dado de forma elegante, lançando exceções que o Controller traduz para o status **404 Not Found**, garantindo maior robustez e clareza no tratamento de erros da aplicação.

---

## 📸 Prints de Funcionamento



### 1. Dashboard e Filtros (React)
![Dashboard React](link_para_imagem_do_react_dashboard.png)

### 2. Cadastro de Dados (React)
![Formulário React](link_para_imagem_do_react_form.png)

### 3. Teste de API e Erro 404 (Postman)
![Postman 404](link_para_imagem_do_postman_404.png)

---

## 🚀 Como executar o projeto

### Pré-requisitos
* MySQL Server instalado e rodando.
* Criar um banco de dados chamado `ecorecicla_db`.

### 1. Configuração do Ambiente (.env)
Na raiz do projeto backend, crie um arquivo `.env` (certifique-se de que ele está no seu `.gitignore`) e adicione suas credenciais:

.env

DB_URL=jdbc:mysql://localhost:3306/ecorecicla_db
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha



No seu `application.properties`, as variáveis devem estar mapeadas assim:

properties

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update



### 2. Executar o Backend

bash

mvn spring-boot:run



### 3. Executar o Frontend

bash

cd frontend
npm install
npm start



---

## 👥 Equipe

* Guilherme Duarte
* Luis Felipe Ferreira Honrado
* Gabrielly Souza


**Data Final de Entrega:** 15/05/2026

**Professora:** Profa. Mestre Sirley Ambrosia Vitorio Addão
