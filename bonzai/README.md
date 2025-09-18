# Dokumentation Bonzai API Mighty Warrios

Dokumentationen nedan innehåller en beskrivning av innehållet i databasen samt tillhörande API-anrop.
URL: [https://tjlw7gjfve.execute-api.eu-north-1.amazonaws.com](https://tjlw7gjfve.execute-api.eu-north-1.amazonaws.com)

## Dokument i databasen

### Room

sk: alla rum börjar med ROOM#. Därefter följer rumstypen, SINGLE, DOUBLE eller SUITE. sk:n avslutas med en slumpmässig sträng som innehåller 5 tecken, versaler, gemener och 0-9. I exemplet nedan visas ett dubbelrum.

#### Exempel

    {
    		"createdAt": "2025-09-17T07:44:07.561Z",
    		"available": true,
    		"pk": "ROOM",
    		"price": 1500,
    		"beds": 1,
    		"sk": "ROOM#DOUBLE#16149"
    	},

### Order

Exempel på en order med två bokade rum.

#### Exempel:

<pre>
[{
"numberOfGuests": 3,
"roomsBooked": [
{
"available": true,
"sk": "ROOM#DOUBLE#7a8c6",
"createdAt": "2025-09-15T13:05:15.482Z",
"pk": "ROOM",
"beds": 2,
"price": 1000
},
{
"available": true,
"sk": "ROOM#SINGLE#1cbf5",
"createdAt": "2025-09-15T13:04:49.493Z",
"pk": "ROOM",
"beds": 1,
"price": 500
}
],
"bookedBy": "User123",
"createdAt": "2025-09-16T14:42:16.342Z",
"numberOfNights": 4,
"price": 1500,
"pk": "ORDER",
"sk": "ORDER#f641a"
}]</pre>

## API-anrop

### ROOMS

#### POST Room

Lägger till ett rum i databasen.

#### Exempel:

<pre>
method: POST
url: /api/rooms</pre>

##### Body:

```json
{ "available": true, "beds": 1, "price": 1500, "type": "double" }
```

##### Response:

```json
{
  "success": true,
  "message": "Room added successfully"
}
```

#### GET all available Rooms

Returnerar alla rum som är tillgängliga för bokning, d.v.s. available: true. I exemplet visas ett rum av varje sort (single, double, suite). I databasen finns totalt 20 rum.

##### Exempel:

<pre>
method: GET
url: /api/rooms
</pre>

##### Body: ingen body

##### Response:

```json
{
  "message": "success",
  "data": [
    {
      "createdAt": "2025-09-15T13:05:19.164Z",
      "available": true,
      "pk": "ROOM",
      "price": 1000,
      "beds": 2,
      "sk": "ROOM#DOUBLE#5ea73"
    },
    {
      "createdAt": "2025-09-15T13:04:48.577Z",
      "available": true,
      "pk": "ROOM",
      "price": 500,
      "beds": 1,
      "sk": "ROOM#SINGLE#2debb"
    },
    {
      "createdAt": "2025-09-15T13:05:52.097Z",
      "available": true,
      "pk": "ROOM",
      "price": 1500,
      "beds": 3,
      "sk": "ROOM#SUITE#8e943"
    }
  ]
}
```

### ORDERS

#### GET Orders

Returnerar samtliga ordrar.

##### Exempel:

<pre>
method: GET
url: /api/orders
</pre>

##### Body: ingen body

##### Response:

```json
{
  "success": true,
  "orders": [
    {
      "numberOfGuests": 1,
      "roomsBooked": [
        {
          "available": true,
          "sk": "ROOM#DOUBLE#a8662",
          "createdAt": "2025-09-16T14:36:47.428Z",
          "pk": "ROOM",
          "beds": 1,
          "price": 1500
        }
      ],
      "bookedBy": "Klara",
      "createdAt": "2025-09-17T07:33:10.070Z",
      "numberOfNights": 1,
      "price": 1500,
      "pk": "ORDER",
      "sk": "ORDER#29c35"
    },
    {
      "numberOfGuests": 3,
      "roomsBooked": [
        {
          "available": true,
          "sk": "ROOM#DOUBLE#5ea73",
          "createdAt": "2025-09-15T13:05:19.164Z",
          "pk": "ROOM",
          "beds": 2,
          "price": 1000
        },
        {
          "available": true,
          "sk": "ROOM#SINGLE#f45c8",
          "createdAt": "2025-09-15T13:04:44.648Z",
          "pk": "ROOM",
          "beds": 1,
          "price": 500
        }
      ],
      "bookedBy": "Namn Namnsson",
      "createdAt": "2025-09-17T10:42:52.597Z",
      "numberOfNights": 1,
      "price": 1500,
      "pk": "ORDER",
      "sk": "ORDER#39382"
    }
  ]
}
```

#### GET Order by id

Returnerar en specifik order baserat på orderId.

##### Exempel:

<pre>
method: GET
url: /api/orders/{orderId} (OBS, endast de 5 sista tecknen i orderId:t ska skickas som parameter)
</pre>

##### Body: ingen body

##### Response:

```json
{
  "success": true,
  "orders": {
    "numberOfGuests": 3,
    "roomsBooked": [
      {
        "available": true,
        "sk": "ROOM#DOUBLE#5ea73",
        "createdAt": "2025-09-15T13:05:19.164Z",
        "pk": "ROOM",
        "beds": 2,
        "price": 1000
      },
      {
        "available": true,
        "sk": "ROOM#SINGLE#f45c8",
        "createdAt": "2025-09-15T13:04:44.648Z",
        "pk": "ROOM",
        "beds": 1,
        "price": 500
      }
    ],
    "bookedBy": "Namn Namnsson",
    "createdAt": "2025-09-17T10:42:52.597Z",
    "numberOfNights": 1,
    "price": 1500,
    "pk": "ORDER",
    "sk": "ORDER#39382"
  }
}
```

#### POST Order

Lägger till en order i databasen. Antal gäster får inte överskrida det totala antalet sängar i rummen.

##### Exempel:

<pre>
method: POST
url: /api/orders
</pre>

##### Body:

```json
{
  "numberOfGuests": 3,
  "rooms": ["ROOM#DOUBLE#16149", "ROOM#SINGLE#2e309"],
  "numberOfNights": 1,
  "name": "Namn Namnsson",
  "email": "user@usermail.com"
}
```

##### Response:

```json
{
  "message": "Successfully created order",
  "orderRooms": [
    {
      "createdAt": "2025-09-15T13:05:19.164Z",
      "available": true,
      "pk": "ROOM",
      "price": 1000,
      "beds": 2,
      "sk": "ROOM#DOUBLE#16149"
    },
    {
      "createdAt": "2025-09-15T13:04:44.648Z",
      "available": true,
      "pk": "ROOM",
      "price": 500,
      "beds": 1,
      "sk": "ROOM#SINGLE#2e309"
    }
  ]
}
```

#### PUT Order by id

Uppdaterar en specifik order baserat på id. Innehållet i bodyn beror på vad som ska uppdateras.

- Om endast antal nätter ska uppdateras behöver endast nights skickas med.
- Samma sak gäller för antal gäster angående nyckelvärdeparet guests.
- Om användaren vill byta rum ska både det gamla rums-id:t och det nya rums-id:t skickas med.

Antalet gäster måste överensstämma med antalet sängar i ordern.

##### Exempel:

<pre>
method: PUT
url: /api/orders/{orderId} (OBS, endast de 5 sista tecknen i orderId:t ska skickas som parameter)
</pre>

##### Body:

```json
{
  "removeRoomId": "ROOM#DOUBLE#6f587",
  "newRoomId": "ROOM#SUITE#d6ab6",
  "numberOfNights": 2,
  "numberOfGuests": 2
}
```

##### Response

```json
{
  "success": true,
  "updatedOrder": {
    "numberOfGuests": 2,
    "modifiedAt": "2025-09-18T12:10:52.503Z",
    "numberOfNights": 2,
    "totalPrice": 3000,
    "roomsBooked": [
      {
        "available": true,
        "sk": "ROOM#SUITE#d6ab6",
        "createdAt": "2025-09-15T13:05:51.361Z",
        "pk": "ROOM",
        "beds": 3,
        "price": 1500
      }
    ]
  }
}
```

#### DELETE Order by id

Hämtar en order baserat på id. Togglar rummen till available: true. Raderar sedan hela ordern.

##### Exempel:

<pre>
method: DELETE
url: /api/orders/{orderId} (OBS, endast de 5 sista tecknen i orderId:t ska skickas som parameter)
</pre>

##### Body: ingen body

##### Response:

```json
{
  "success": true,
  "message": "Order successfully deleted"
}
```
