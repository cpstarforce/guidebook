# ArmyGuidebook

ArmyGuidebook is a GitHub repository that may be forked to generate your own aesthetic army guidebook. This is intended for Club Penguin armies. However, with some intelligence, you may be able to transform this into a guidebook outside of Club Penguin armies, too. You can begin by forking this repository.

## Features

- **Very lightweight:** You can choose to install the minified resources to make your application use very few kilobytes of storage. As a result, this application also respects bandwidth.
- **Blazing fast:** A built-in preloader is included in this application. This preloader speeds up loading of articles, and can be toggled by the user. Also, resources are loaded smartly.
- **Progressive web application:** This application is a progressive web application (PWA) for the browser, meaning users will have an option to install your application as a browser-run application on their device.
- **JavaScript promises and async:** JavaScript promises and asynchronous functions have been applied almost everywhere. This allows a very fast application to be run.
- **Aesthetic:** A strong appeal of beauty is necessary for a good application. It brings a good and professional look to your readers.
- **Discord integration:** Optionally, you can directly connect to a Discord server and create an inter-messaging environment inside the guidebook client.

## Configuration

You can control your configuration in the `config.json` file. Your configuration includes basic properties that describe your guidebook, date and time format, password-protection features, and more.

1. `name` • (string) The name of your guidebook.
2. `armyName` • (string) The name of your Club Penguin army.
3. `lastUpdated` • (number) The timestamp depicting when the guidebook was last modified.
4. `longDateFormat` • (string) The format to use for displaying long dates.
5. `shortDateFormat` • (string) The format to use for displaying short dates.
6. `passwordProtected` • (boolean) Defines whether the guidebook should be password-protected.
7. `hashedPassword` • (string) Defines an encrypted password which must be used to access the guidebook. This only works if password-protection has been turned on using the `passwordProtected` property.
8. `hashCostFactor` • (number) Defines the cost factor to use while accessing the hashed password during login.
9. `entrypoint` • (string) Sets the article which opens as soon as the user authorizes.
10. `articleDirectory` • (string) The directory in which article HTML files are located.
11. `mediaDirectory` • (string) The directory in which media files are located.

To find a list of tokens you can use for date formats in properties `4` and `5`, please visit:
https://moment.github.io/luxon/#/formatting?id=table-of-tokens

To generate a hashed, encrypted password for property `7`, please visit a safe encryption site, such as: https://bcrypt.online/.
You can select any cost factor for encryption, but ensure that the cost factor you use matches with the one specified in the `hashCostFactor` property. By default, the cost factor is `10`. Lower cost factors allow accessing the password faster but decryption becomes easier. On the other hand, higher cost factors allow accessing the password slower but decryption becomes harder. Therefore, you might want to pick something in the middle. The cost factor is also known as the "salt".

Learn more about hashing passwords:
https://auth0.com/blog/hashing-in-action-understanding-bcrypt/

To set up Discord integration for your Discord server, please install WidgetBot to the server. To do so, visit https://add.widgetbot.io/. After installing WidgetBot to a guild, go to `config.json` and under the `WidgetBot` property, fill in the necessary details. You will have to input the guild and the channel IDs. The user will always be able to navigate between other channels in the crate that should display on the bottom right corner of the screen. To disable the crate from displaying at all, set the `available` property under the `WidgetBot` property to `false`. You can set the property value to `true` again later if integrate WidgetBot in the future.

### Progressive Web Application

An application built using this army guidebook template is a progressive web application (PWAs), which means that you can install the webpage as a local app on a desktop or mobile device. To configure the PWA, edit the `manifest.json` file. To remove the web manifest and the PWA entirely, remove the `<link rel="manifest" …>` statement from `index.html` (Line 18). You can also delete the `manifest.json` file to get rid of the PWA.

### Warning: Password-Protection

Password-protection is a feature that Army Guidebook Template offers you. However, please note that in this template, it runs entirely on frontend. Although, it uses a hashed password, it is still very easy for anyone to manipulate the running code in their browser and break in. Therefore, password-protection is a very weak layer of security. If you have a backend, you might be interested in fetching the articles and the hash from the server.

Password-protection is still an option. But, remember, it is not fully protective and is easily bypassable.

## Articles

### Creating an article

To create a new article, follow these steps…

1. Create your article's HTML file in the `articles` directory. If the article you are trying to create is nested under a category, you might be interested in locating your article under a sub-directory, such as `articles/Category_Name`.
2. Add content to your HTML file. The content you write as HTML will be printed on the client when being viewed, as if it were part of the website itself.
3. To make your content accessible and viewable, add your article to the `articles.json` file.
4. Control other properties of your article in the `articles.json` file, such as the `nested` and `listed` property. You should provide a `name` property for the article to be correctly displayed.
5. Your article should be accessible after following these steps correctly.

**Nested articles:** Articles can appear nested, or categorized, on the navigation menu. This is actually only a style, but is often used to establish a navigation interface with categories.

**Listed articles:** Listed articles are shown on the navigation, whereas unlisted articles are not. This is useful to make articles accessible via URL only ("unlisted articles").

### Variables

You can use variables in an article to add dynamic text, and can be added as plain text, in attributes, or in JavaScript. A variable uses the `{{category.variable}}` syntax. Variables can belong to categories such as `guidebook` or `article`. There are currently 7 variables available…

- `{{guidebook.name}}` • Inserts the name of the guidebook, as per the `name` property in the `config.json` file.
- `{{guidebook.armyName}}` • Inserts the army display name, as per the `armyName` property in the `config.json` file.
- `{{guidebook.lastUpdated}}` • Inserts a dynamic HTML timestamp that depicts when the guidebook was last updated. This date can only be updated manually by changing the `lastUpdated` property in the `config.json` file.
- `{{guidebook.passwordProtected}}` • Inserts "password-protected" if the guidebook is password-protected. Otherwise, inserts "not password-protected".
- `{{guidebook.password}}` • Inserts the password provided by user input.
- `{{guidebook.entrypoint}}` • Inserts the entrypoint query of the guidebook.
- `{{guidebook.articleDirectory}}` • Inserts the article directory path of the guidebook.
- `{{guidebook.mediaDirectory}}` • Inserts the media directory path of the guidebook.

- `{{article.name}}` • Inserts the name of the current article. The value depends on the `name` property assigned in the `articles.json` file.
- `{{article.path}}` • Inserts the path of the current article interpreted by the client.
- `{{article.nested}}` • Inserts "nested" if the current article is listed. Otherwise, inserts "not nested". The value depends on the `nested` property assigned in the `articles.json` file.
- `{{article.listed}}` • Inserts "listed" if the current article is listed. Otherwise, inserts "not listed". The value depends on the `listed` property assigned in the `articles.json` file.

Variables only work in specific areas, such as article HTML files.

### Functions

You can use functions in an article to add magic to the HTML embed. A function uses the `<!-- category:function -->` syntax, which will result in a markdown comment in the HTML file. Just like variables, they too have categories. There are 2 functions available…

- `<!-- page:centered -->` • Aligns the article to the center, vertically and horizontally.

### CSS Classes

You can use the following CSS classes to apply styles to an element in an article or in the app itself…

- `prevent-selection` • Prevents the user from selecting the element.
- `danger` • Only for the `<small>` tag. Gives the small text a slight red tint to depict danger.

## Dependencies and Credits

This guidebook has been made possible using two external libraries. Much of the code, however, has been written by Fun X Time during his time at the Star Force. All rights of this code are strictly reserved with Fun X Time and the Star Force, and copyright infrigements may be taken seriously. The licensing of this application is subject to change, too. By downloading this repository or any part of its code, you agree to this license. Only the external libraries and fonts used are not subject to this license. This priority agreement comes before the MIT License.

- bcrypt.js (bcrypt)
- luxon.js (Luxon)
- crate.js (WidgetBot)

External libraries always use minified files and are included in this client bundle. No requests are made to the outside. The same also applies for fonts included in the client bundle…

- Outfit
- Unbounded

Fonts were provided by Google Fonts.