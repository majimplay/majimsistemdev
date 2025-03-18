<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Painel Administrativo - Gerenciar Produtos</title>
  <style>
    /* Estilos baseados em meuprimeirosite/admin.html */
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f0f2f5;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .hidden { display: none; }
    .admin-panel {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
    }
    th, td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th { background: #f8f9fa; }
    tr:hover { background: #f9f9f9; }
    input[type="text"], input[type="number"] {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 150px;
    }
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.3s;
    }
    .btn-edit { background: #4CAF50; color: white; }
    .btn-delete { background: #f44336; color: white; }
    .btn:hover { opacity: 0.9; }
    .welcome-banner {
      background: #2196F3;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    img.product-image {
      height: 50px;
      border-radius: 4px;
      object-fit: cover;
    }
    .image-upload {
      position: relative;
      display: inline-block;
    }
    .image-upload input[type="file"] { display: none; }
    .upload-label {
      background: #2196F3;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.3s;
    }
    .upload-label:hover { opacity: 0.9; }
    .image-gallery {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .image-container { position: relative; }
    .delete-image {
      position: absolute;
      top: -8px;
      right: -8px;
      background: red;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: none;
      cursor: pointer;
    }
    .image-container:hover .delete-image { display: block; }
    .editable-field {
      border-bottom: 1px dashed #666;
      cursor: text;
      padding: 4px;
    }
    .editable-field:focus {
      outline: none;
      background: #f0f8ff;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <!-- Mensagem de carregamento -->
  <div id="message">Carregando...</div>
  <!-- Banner de Boas-vindas -->
  <div class="welcome-banner hidden" id="userWelcome"></div>
  <!-- Conteúdo Administrativo -->
  <div class="admin-panel hidden" id="adminContent">
    <h2>Gerenciamento de Produtos</h2>
    <!-- Formulário para adicionar produto (somente para admin) -->
    <form id="productForm">
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
        <input type="text" id="productName" placeholder="Nome do Produto" required>
        <input type="number" id="productPrice" step="0.01" placeholder="Preço" required>
        <div class="image-upload">
          <!-- Preview da imagem selecionada -->
          <img id="imagePreview" src="" alt="Miniatura" style="display:none; max-height:100px; margin-bottom:10px;">
          <label class="upload-label">
            Escolher Imagem
            <input type="file" id="productImage" accept="image/*" required>
          </label>
        </div>
        <button type="submit" class="btn btn-edit">➕ Adicionar</button>
      </div>
    </form>
    <!-- Tabela de Produtos -->
    <table id="productsTable">
      <thead>
        <tr>
          <th>Imagens</th>
          <th>Produto</th>
          <th>Preço</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
  <!-- Parse SDK -->
  <script src="https://unpkg.com/parse/dist/parse.min.js"></script>
  <script>
    /* Variável global para definir o modo apenas visualização */
    let readOnly = false;

    /* 1. Inicialização do Parse */
    Parse.initialize("TYP8SUA8qxmHIRs1mHbiFalgRxCEf51sOiSWmNEY", "n4Gfko9sO7jiAUnWX5U5GGCDQ5QtPWX97K4TzB8I");
    Parse.serverURL = "https://parseapi.back4app.com";

    /* 2. Inicialização da Página */
    async function initPage() {
      const user = Parse.User.current();
      if (user) {
        // Se estiver logado, verifica se é admin
        const isAdminLocal = await checkIfUserIsAdmin(user);
        if (isAdminLocal) {
          readOnly = false;
          document.getElementById('userWelcome').innerHTML = `Bem-vindo, <strong>${user.get("username")}</strong>!`;
        } else {
          readOnly = true;
          document.getElementById('userWelcome').innerHTML = `Olá, <strong>${user.get("username")}</strong>! Visualização somente.`;
          document.getElementById('productForm').style.display = 'none';
        }
      } else {
        // Se não estiver logado, define modo somente visualização
        readOnly = true;
        document.getElementById('productForm').style.display = 'none';
        document.getElementById('userWelcome').innerHTML = `Visualização somente.`;
      }
      document.getElementById('adminContent').classList.remove('hidden');
      document.getElementById('userWelcome').classList.remove('hidden');
      document.getElementById('message').classList.add('hidden');
      loadProducts();
    }

    async function checkIfUserIsAdmin(user) {
      // Verifica se o usuário possui a Role "admin"
      const roleQuery = new Parse.Query(Parse.Role);
      roleQuery.equalTo("name", "admin");
      roleQuery.equalTo("users", user);
      const count = await roleQuery.count();
      return count > 0;
    }

    /* 3. Classe Produto (Parse Object) */
    const Produto = Parse.Object.extend("Produto");

    /* 4. Carregar Produtos */
    async function loadProducts() {
      const query = new Parse.Query(Produto);
      try {
        const results = await query.find();
        updateTable(results);
      } catch (error) {
        alert("Erro ao carregar produtos: " + error.message);
      }
    }

    /* 5. Atualizar a Tabela de Produtos */
    function updateTable(produtos) {
      const tbody = document.querySelector('#productsTable tbody');
      tbody.innerHTML = "";
      produtos.forEach(produto => {
        const imagens = produto.get("imagens") || [];
        const imagemHtml = imagens.map((url, index) => `
          <div class="image-container">
            <img src="${url}" class="product-image">
            ${!readOnly ? `<div class="delete-image" onclick="removeImage('${produto.id}', ${index})">×</div>` : ''}
          </div>
        `).join("");
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="image-gallery">${imagemHtml}</div>
            ${!readOnly ? `<button class="btn btn-edit" onclick="addImage('${produto.id}')">Adicionar Imagem</button>` : ''}
          </td>
          <td>
            <div class="editable-field" ${!readOnly ? 'contenteditable="true"' : ''} data-id="${produto.id}" data-field="nome">${produto.get("nome")}</div>
          </td>
          <td>
            <div class="editable-field" ${!readOnly ? 'contenteditable="true"' : ''} data-id="${produto.id}" data-field="preco">${parseFloat(produto.get("preco")).toFixed(2)}</div>
          </td>
          <td>
            ${!readOnly ? `
              <button class="btn btn-edit" onclick="editProduct('${produto.id}')">Editar</button><br><br>
              <button class="btn btn-delete" onclick="deleteProduct('${produto.id}')">Excluir</button>
            ` : ''}
          </td>
        `;
        tbody.appendChild(tr);
      });
      // Se não estiver em modo somente visualização, permite edição inline
      if (!readOnly) {
        document.querySelectorAll('.editable-field').forEach(field => {
          field.addEventListener('input', debounce(() => {
            const id = field.getAttribute('data-id');
            const fieldName = field.getAttribute('data-field');
            const value = fieldName === "preco" ? parseFloat(field.textContent) : field.textContent;
            updateProductField(id, fieldName, value);
          }, 500));
        });
      }
    }

    // Função debounce
    function debounce(func, timeout = 300){
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
      };
    }

    async function updateProductField(id, fieldName, value) {
      const query = new Parse.Query(Produto);
      try {
        const produto = await query.get(id);
        produto.set(fieldName, value);
        await produto.save();
      } catch (error) {
        alert("Erro ao atualizar: " + error.message);
      }
    }

    /* 6. Adicionar Novo Produto (somente para admin) */
    document.getElementById('productForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('productName').value;
      const preco = parseFloat(document.getElementById('productPrice').value);
      const fileInput = document.getElementById('productImage');
      const file = fileInput.files[0];
      if (!file) {
        alert("Selecione uma imagem.");
        return;
      }
      try {
        // Cria e salva o arquivo usando Parse.File
        const parseFile = new Parse.File(file.name, file);
        await parseFile.save();
        // Cria o novo produto com os campos desejados
        const produto = new Produto();
        produto.set("nome", nome);
        produto.set("preco", preco);
        produto.set("imagens", [parseFile.url()]);
        await produto.save();
        document.getElementById('productForm').reset();
        // Esconde o preview após o reset
        document.getElementById('imagePreview').style.display = 'none';
        loadProducts();
      } catch (error) {
        alert("Erro ao adicionar produto: " + error.message);
      }
    });

    /* 7. Deletar Produto (somente para admin) */
    async function deleteProduct(id) {
      if (!confirm("Deseja realmente excluir este produto?")) return;
      const query = new Parse.Query(Produto);
      try {
        const produto = await query.get(id);
        await produto.destroy();
        loadProducts();
      } catch (error) {
        alert("Erro ao excluir produto: " + error.message);
      }
    }

    /* Função para redirecionar à página de edição */
    function editProduct(id) {
      // Redireciona para a página editar.html passando o id do produto via query string
      window.location.href = `editar.html?id=${id}`;
    }

    /* 8. Adicionar Imagem a Produto Existente (somente para admin) */
    async function addImage(produtoId) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const parseFile = new Parse.File(file.name, file);
          await parseFile.save();
          const query = new Parse.Query(Produto);
          const produto = await query.get(produtoId);
          const imagens = produto.get("imagens") || [];
          imagens.push(parseFile.url());
          produto.set("imagens", imagens);
          await produto.save();
          loadProducts();
        } catch (error) {
          alert("Erro ao adicionar imagem: " + error.message);
        }
      };
      input.click();
    }

    /* 9. Remover Imagem (somente para admin) */
    async function removeImage(produtoId, index) {
      if (!confirm("Deseja realmente remover esta imagem?")) return;
      try {
        const query = new Parse.Query(Produto);
        const produto = await query.get(produtoId);
        let imagens = produto.get("imagens") || [];
        imagens.splice(index, 1);
        produto.set("imagens", imagens);
        await produto.save();
        loadProducts();
      } catch (error) {
        alert("Erro ao remover imagem: " + error.message);
      }
    }

    /* 10. Preview da Imagem Selecionada */
    document.getElementById('productImage').addEventListener('change', function(event) {
      const file = event.target.files[0];
      const preview = document.getElementById('imagePreview');
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        preview.src = '';
        preview.style.display = 'none';
      }
    });

    /* 11. Inicializar a Página */
    initPage();
  </script>
</body>
</html>
