# AWS WebApp NoSQL hozzáféréssel



Az Amazon NoSQL adatbázis-szolgáltatásához az Amazon DynamoDB-t használhatjuk. Ebben a példában megmutatom, hogyan lehet létrehozni egy egyszerű webalkalmazást az Express.js és az EJS (Embedded JavaScript templating) használatával Node.js-ben, ami képes adatok olvasására és írására egy DynamoDB táblában.

## Tartalomjegyzék

- [Összetevők](#Összetevők)
- [DynamoDB tábla létrehozása](#DynamoDB-tábla-létrehozása)
- [IAM user létrehozása DynamoDB hozzáféréssel](#IAM-user-létrehozása-DynamoDB-hozzáféréssel)
- [Alkalmazás helyi futtatása](#Alkalmazás-helyi-futtatása)
- [Alkalmazás futtatása Elastic Beanstalk segítségével](#Alkalmazás-futtatása-Elastic-Beanstalk-segítségével)
  - [Elastic Beanstalk környezet létrehozása](#Elastic-Beanstalk-környezet-létrehozása)
  - [Adatbázis hozzáférési paraméterek hozzáadása Elastic Beanstalk környezethez](#Adatbázis-hozzáférési-paraméterek-hozzáadása-Elastic-Beanstalk-környezethez)
  - [CodePipeline konfigurálása a folyamatos üzembehelyezéshez](#CodePipeline-konfigurálása-a-folyamatos-üzembehelyezéshez)
- [JSON generálás](#JSON-generálás)


## Összetevők

- AWS Elastic Beanstalk
- AWS DynamoDB

## DynamoDB tábla létrehozása

1. Lépjünk be az AWS Management Console-ba, és keressük meg a DynamoDB szolgáltatást.
2. Kattintsunk az **Create table** gombra.
3. Adja meg a tábla nevét, és az elsődleges kulcsot (Partition key).
    - Tábla neve: mentordata
    - Primary key: id (String)
4. Kattintsunk a **Create table** gombra.

Pár perc múlva a tábla elkészül, és készen áll az adatok fogadására.

## IAM user létrehozása DynamoDB hozzáféréssel

1. Lépjünk be az AWS Management Console-ba, és keressük meg az IAM szolgáltatást.
2. Kattintsunk az **Add user** gombra.
3. Adja meg a felhasználó nevét.
4. Kattintsunk a **Next** gombra.
5. Válasszuk ki a **Attach policies directly** lehetőséget, és keressük meg a **AmazonDynamoDBFullAccess** jogosultságot.
6. Kattintsunk a **Next** gombra.
7. Kattintsunk a **Next** gombra.
8. Kattintsunk a **Create user** gombra.
9. Válasszuk ki a felhasználót, és kattintsunk a **Security credentials** fülre.
10. Válasszuk ki a a **Commant Line Interface (CLI)** lehetőséget.
11. Jelöljük be a **I understand the above recommendation and want to proceed to create an access key.** lehetőséget.
12. Kattintsunk a **Next** gombra.
13. Kattintsunk a **Create access key** gombra.
14. A generált hozzáférési kulcsokat mentse el, mert csak egyszer jelenik meg.

## Alkalmazás helyi futtatása

1. Klónozd le a projektet
2. Telepítsd a szükséges csomagokat: `npm install`
3. Hozz létre egy `.env` fájlt a projekt gyökérkönyvtárában a következő tartalommal:

```
# .env file
# .env file
AWS_ACCESS_KEY="{AWS access key}"
AWS_SECRET_KEY="{AWS secret key}"
AWS_REGION=eu-central-1
AWS_TABLE_NAME=mentordata
```

4. Indítsd el az alkalmazást: `npm start`
5. Nyisd meg a böngészőt, és látogasd meg a `http://localhost:8080` címet

## Alkalmazás futtatása Elastic Beanstalk segítségével

### Elastic Beanstalk környezet létrehozása

1. Lépjünk be az AWS konzolba
2. Keresőbe írjuk be az Elastic Beanstalk szolgáltatást
3. Kattintsunk a "Create environment" gombra
4. Töltsük ki a kötelező mezőket
   - Application name: mentordata
   - Environment name: mentordata-env
   - Domain (opcionális): mentordata
   - Platform: Node.js
   - Platform branch: Node.js 20
   - Application code: Sample application
   - Presets: Single instance
5. Kattintsunk a "Next" gombra
6. Create and use new service role
   - Service role name: mentordata-role
7. EC2 key pair: Create new key pair
   - Key pair name: mentordata-key
8. Kattintsunk a "Next" gombra
9. Kattintsunk a "Skip to review" gombra
10. Kattintsunk a "Submit" gombra

Ha létrejött a példa alkalmazás, adjuk hozzá az alkalmazás számára szükséges adatbázis hozzásférési paramétereket

### Adatbázis hozzáférési paraméterek hozzáadása Elastic Beanstalk környezethez

1. Lépjünk be az AWS konzolba
2. Keresőbe írjuk be az Elastic Beanstalk szolgáltatást
3. Kattintsunk a "mentordata-env" környezetre
4. A bal oldali menüben kattintsunk a "Configuration" menüpontra
5. "Updates, monitoring, and logging" részben kattintsunk a "Edit" gombra
6. Keressük meg az "Environment properties" részt és kattintsunk az "Add environment property" gombra
7. Adjuk hozzá a következő környezeti változókat

| Név         | Érték                                              |
| ----------- | -------------------------------------------------- |
| AWS_ACCESS_KEY     | {AWS access key}                                          |
| AWS_SECRET_KEY | {AWS secret key} |
| AWS_REGION   | eu-central-1                                    |
| AWS_TABLE_NAME     | mentordata                                             |

8. Kattintsunk a "Apply" gombra

Pár perc múlva életbe lépnek a változtatások.

### CodePipeline konfigurálása a folyamatos üzembehelyezéshez

Végül CodePipeline segítségével töltsd fel a saját alkalmazásodat:

1. Keresőbe írjuk be a CodePipeline szolgáltatást
2. Kattintsunk a "Create pipeline" gombra
3. Töltsük ki a kötelező mezőket
   - Pipeline name: mentordata-pipeline
   - Pipeline type: V1
   - Execution mode: Suspended
   - Service role: New service role
   - Role name: mentordata-pipeline-role
4. Kattintsunk a "Next" gombra
5. Source provider: GitHub (Version 2)
   - Repository: {GitHub repository link}
   - Branch: main
6. Kattintsunk a "Next" gombra
7. Build provider: Skip build stage
8. Deployment provider: Elastic Beanstalk
   - Application name: mentordata
   - Environment name: mentordata-env
9. Kattintsunk a "Create pipeline" gombra

Amikor elkészült a pipeline, a GitHub repository-ba feltöltött változások automatikusan frissítik az alkalmazást az Elastic Beanstalk környezetben.

Pár perc múlva a [http://mentordata.eu-central-1.elasticbeanstalk.com/](http://mentordata.eu-central-1.elasticbeanstalk.com/) címen elérhető lesz az alkalmazás.


## JSON generálás

https://json-generator.com/

Séma:

```bash
[
  '{{repeat(1, 1)}}',
  {
    kor: '{{integer(18, 75)}}',
    nev: {
      vezeteknev: '{{random("Nagy","Kovács","Horváth","Tóth","Szabó","Kiss","Molnár","Varga","Farkas","Pap")}}',
        keresztnev: '{{random("Gergő","Petra","Balázs","Krisztián","Anikó","Márton","Zsófia","Bence","Dóra","Gábor",)}}'}
    }
]
```