let bcrypt = dcodeIO.bcrypt;

async function autologin(password) {
  if (await bcrypt.compare(password, client.config.hashedPassword)) {
    await client.login.finish();
  } else {
    await client.login.request();
  }
}

async function loginPasswordInput(input) {
  if (await bcrypt.compare(input, client.config.hashedPassword)) {
    client.password = input;
    localStorage.setItem("Password", input);
    await client.login.finish();
  } else {
    let input = document.querySelector("#login-error");
    if (input) input.innerHTML = "Password does not match. Keep typing till you get it right!";
  }
}

Guidebook.readVariables = function (string = "", data = {}) {
  return string
    .replaceAll("{{guidebook.name}}", `<span class="variable-colored guidebook__name">${client.config.name}</span>`)
    .replaceAll("{{guidebook.shortName}}", `<span class="variable-colored guidebook__shortName">${client.config.shortName}</span>`)
    .replaceAll("{{guidebook.armyName}}", `<span class="variable-colored guidebook__armyName">${client.config.armyName}</span>`)
    .replaceAll("{{guidebook.lastUpdated}}", `<span class="variable guidebook__lastUpdated luxon">${client.config.lastUpdated.luxon()}</span>`)
    .replaceAll("{{guidebook.passwordProtected}}", `<span class="variable guidebook__passwordProtected">${client.config.passwordProtected}</span>`)
    .replaceAll("{{guidebook.password}}", `<span class="variable-colored guidebook__password">${client.password}</span>`)

    .replaceAll("{{article.name}}", `<span class="variable-colored article__name">${data.article.name}</span>`)
    .replaceAll("{{article.path}}", `<span class="variable-colored article__path">${data.article.path}</span>`)
    .replaceAll("{{article.nested}}", `<span class="variable-colored article__nested">${data.article.nested}</span>`)
    .replaceAll("{{article.listed}}", `<span class="variable-colored article__listed">${data.article.listed}</span>`)
}