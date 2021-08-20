
# Weather app for Devgrid Challenge.

## Languages and frameworks:

### Backend API
* Python
* Flask

### Frontend
* Javascript
* Svelte
* Boostrap

### Prerequisites
* Docker
* Valid Open Weather API key (https://openweathermap.org/api).

## Usage

### Run the backend
Configure your API_KEY on /api/config.py, then:
- `cd api`.
- `docker-compose up`.

Your backend is accessible on http://localhost:3000/.
Send request to http://localhost:3000/weather/city_name to get results per city.
Or send request to http://localhost:3000/weather?max= to get cached per cities.

### Run the frontend
Open a new terminal tab.
In the project root, run:
- `cd frontend`.
- `docker-compose up`.

Now navigate on http://localhost:5000/ using any modern browser and enjoy.
