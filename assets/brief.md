
Software Tech Challenge
1 challenge
Expected answer: 1 link to repository

Please deliver the solution by uploading them on a publicly available repository, where it is possible to demonstrate progress throughout the development. Please avoid referring to the company’s name, as this raises false alarm security alerts.
Question Title
1. The purpose of this assessment is to complete a simple programming assignment. You are required to:

Produce a working, object-oriented and tested source code to solve the problem
Walk through your code with the assessor, answering questions on the code and programming/design choices as requested by the assessor

Write a web API, which will be deployed on cloud infrastructure, with associated tests that can price a basket of goods, accounting for special offers.

The goods that can be purchased, which are all priced in $, are:

Soup – 65p per tin
Bread – 80p per loaf
Milk – $1.30 per bottle
Apples – $1.00 per bag
Current special offers are:

Apples have 10% off their normal price this week
Buy 2 tins of soup and get a loaf of bread for half price
The program should accept a list of items (with a date) in the basket and output the subtotal, the special offer discounts and the final price.


Input should be via a suitable structured input (i.e., a List,  such as {‘~DATE~’, ‘item1’, ‘item2’, ‘item3’, … } ) :

 either via the command line in the form PriceBasket List. For example: PriceBasket {‘16/1/2020’, ‘milk’, ‘Bread’, ‘apples’}
Or via HTTP request to an appropriate endpoint with the same List

Output should be to the console and appropriate HTTP requests (with appropriate error codes), for example:

```

Subtotal: $3.10

Apples 10% off: -10p

Total: $3.00

```

And HTTP 200 for success


If no special offers are applicable, the code should output:

```

Subtotal: $1.30

(no offers available)

Total: $1.30

```

And HTTP 200 for success


The code and design should meet these requirements but be sufficiently flexible to allow for future extensibility. The code should be uploaded to a publicly shared code repository with frequent commits, well structured, suitably documented, have error handling and be tested. 


Good Architecture & DevOps practices & technology (and both) will score extra points.




Please deliver the solution by uploading them on a publicly available repository and provide the link below. The code will be reviewed by 2 other developers. Where it is possible to demonstrate progress throughout the development. Please avoid referring to the company’s name, as this raises false alarm security alerts.