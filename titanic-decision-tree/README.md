# Titanic Decision Tree Animation

This project is a simple web application that visualizes a decision tree based on the Titanic dataset. The decision tree illustrates how different passenger features influence the likelihood of survival.

## Project Structure

```
titanic-decision-tree
├── index.html        # Main HTML document for the web application
├── style.css         # Styles for the web application
├── script.js         # JavaScript code for decision tree logic and animation
├── data
│   └── titanic.json  # Titanic dataset in JSON format
└── README.md         # Documentation for the project
```

## Getting Started

To run the web application, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd titanic-decision-tree
   ```

2. **Open the `index.html` file** in your web browser:
   - You can simply double-click the `index.html` file or use the command:
     ```bash
     "$BROWSER" index.html
     ```

## Overview of the Decision Tree Animation

The decision tree is constructed using various passenger features such as age, gender, and class. Each branch of the tree represents a decision point based on these features, leading to the final outcome of survival or death.

## Titanic Dataset

The dataset used in this project is sourced from the Titanic passenger list, which includes the following features:

- **PassengerId**: Unique identifier for each passenger
- **Survived**: Survival status (0 = No, 1 = Yes)
- **Pclass**: Ticket class (1st, 2nd, 3rd)
- **Name**: Name of the passenger
- **Sex**: Gender of the passenger
- **Age**: Age of the passenger
- **SibSp**: Number of siblings/spouses aboard
- **Parch**: Number of parents/children aboard
- **Ticket**: Ticket number
- **Fare**: Fare paid for the ticket
- **Cabin**: Cabin number
- **Embarked**: Port of embarkation (C = Cherbourg; Q = Queenstown; S = Southampton)

## Acknowledgments

- The decision tree visualization is inspired by existing projects and aims to provide an educational tool for understanding decision-making processes in data science.