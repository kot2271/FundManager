# FundManager

## Задача:
Разработать продвинутый смарт-контракт, который создаёт смарт-контракты для различных благотворительных фондов и управлять ими. 
Пользователи могут организовывать собственные фонды, прикреплять к ним описания и вызывать функцию для отправки средств конечному получателю(на EOA гринпис например), который должен указываться при создании фонда.
## Критерии:
Для всех проверок использовать вместо require и assert, кастомные ошибки и конструкции типа if(условие) revert customError();

Избегать циклы при изменении состояния блокчейна.

## Installation

Clone the repository using the following command:
Install the dependencies using the following command:
```shell
npm i
```

## Deployment

Fill in all the required environment variables(copy .env-example to .env and fill it). 

Deploy contract to the chain (polygon-mumbai):
```shell
npx hardhat run scripts/deploy.ts --network polygonMumbai
```

## Verify

Verify the installation by running the following command:
```shell
npx hardhat verify --network polygonMumbai {CONTRACT_ADDRESS}
```

## Tasks

Create a new task(s) and save it(them) in the folder "tasks". Add a new task_name in the file "tasks/index.ts"

Running a donate task:
```shell
npx hardhat donate --contract {CONTRACT_ADDRESS} --value {AMOUNT} --network polygonMumbai
```

Running a sendFunds task:
```shell
npx hardhat sendFunds --contract {CONTRACT_ADDRESS} --receiver {RECEIVER_ADDRESS} --amount {AMOUNT} --network polygonMumbai
```

Running a getFoundationBalance task:
```shell
npx hardhat getFoundationBalance --contract {FUNDMANAGER_CONTRACT_ADDRESS} --foundation {FOUNDATION__CONTRACT_ADDRESS} --network polygonMumbai
```

Running a createFoundation task:
```shell
npx hardhat createFoundation --contract {FUNDMANAGER_CONTRACT_ADDRESS} --receiver {RECEIVER_ADDRESS} --description {STRING_DESCRIPTION} --value {AMOUNT} --network polygonMumbai
```

Running a transferFundsToReceiver task:
```shell
npx hardhat transferFundsToReceiver --contract {FUNDMANAGER_CONTRACT_ADDRESS} --foundation {NEW_FOUNDATION__CONTRACT_ADDRESS} --amount {AMOUNT} --network polygonMumbai
```
