/**
 * assets/js/frontend.js
 */

jQuery(document).ready(function ($) {
    $(".weather-block-container").each(function () {
        var $container = $(this);
        var $loading = $container.find(".weather-loading");
        var $content = $container.find(".weather-content");
        var $error = $container.find(".weather-error");

        // Demander la géolocalisation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    // Succès de la géolocalisation
                    var latitude = position.coords.latitude;
                    var longitude = position.coords.longitude;

                    // Appel AJAX pour récupérer la météo
                    $.ajax({
                        url: weatherBlock.ajax_url,
                        type: "POST",
                        data: {
                            action: "get_weather_data",
                            latitude: latitude,
                            longitude: longitude,
                            nonce: weatherBlock.nonce,
                        },
                        success: function (response) {
                            $loading.hide();
                            if (response.success) {
                                displayWeather($content, response.data);
                                $content.show();
                            } else {
                                showError(
                                    $error,
                                    "Erreur lors de la récupération des données météo"
                                );
                            }
                        },
                        error: function () {
                            $loading.hide();
                            showError($error, "Erreur de connexion");
                        },
                    });
                },
                function (error) {
                    // Erreur de géolocalisation
                    $loading.hide();
                    var message =
                        "Veuillez autoriser la géolocalisation pour voir la météo de votre région.";
                    showError($error, message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 1000, // 1 minute
                }
            );
        } else {
            $loading.hide();
            showError(
                $error,
                "La géolocalisation n'est pas supportée par votre navigateur."
            );
        }

        function displayWeather($content, data) {
            var html =
                '<div class="weather-display">' +
                '<div class="weather-header">' +
                '<h3 class="weather-location">' +
                data.location +
                ", " +
                data.country +
                "</h3>" +
                "</div>" +
                '<div class="weather-main">' +
                '<div class="weather-icon">' +
                '<img src="https:' +
                data.icon +
                '" alt="' +
                data.condition +
                '">' +
                "</div>" +
                '<div class="weather-temp">' +
                Math.round(data.temperature) +
                "°C</div>" +
                '<div class="weather-condition">' +
                data.condition +
                "</div>" +
                "</div>" +
                '<div class="weather-details">' +
                '<div class="weather-detail">' +
                '<span class="detail-label">Humidité:</span> ' +
                data.humidity +
                "%" +
                "</div>" +
                '<div class="weather-detail">' +
                '<span class="detail-label">Vent:</span> ' +
                data.wind_speed +
                " km/h " +
                data.wind_direction +
                "</div>" +
                "</div>" +
                "</div>";

            $content.html(html);
        }

        function showError($error, message) {
            $error
                .html(
                    '<div class="weather-error-message">' + message + "</div>"
                )
                .show();
        }
    });
});
