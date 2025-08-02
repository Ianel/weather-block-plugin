/**
 * assets/js/editor.js
 */

(function (blocks, i18n, element, components, editor) {
    var el = element.createElement;
    var __ = i18n.__;

    blocks.registerBlockType("weather-block/weather-display", {
        title: __("Bloc Météo", "weather-block"),
        description: __(
            "Affiche la météo actuelle basée sur la géolocalisation de l'utilisateur avec température, conditions et détails.",
            "weather-block"
        ),
        icon: el(
            "svg",
            {
                width: 24,
                height: 24,
                viewBox: "0 0 24 24",
                fill: "currentColor",
            },
            el("path", {
                d: "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z",
            })
        ),
        category: "widgets",
        keywords: ["weather", "météo", "température", "localisation"],
        example: {
            attributes: {
                preview: true,
            },
        },

        edit: function (props) {
            var isPreview = props.attributes.preview;

            // Si c'est le mode preview (lors de l'ajout du bloc)
            if (isPreview) {
                return el(
                    "div",
                    {
                        className: "weather-block-preview-card",
                        style: {
                            background:
                                "linear-gradient(135deg, #74b9ff, #0984e3)",
                            color: "white",
                            borderRadius: "12px",
                            padding: "16px",
                            minHeight: "120px",
                            position: "relative",
                            overflow: "hidden",
                        },
                    },
                    // Date en haut
                    el(
                        "div",
                        {
                            style: {
                                fontSize: "12px",
                                opacity: "0.9",
                                marginBottom: "8px",
                            },
                        },
                        "Mercredi 2 août 2025"
                    ),

                    // Contenu principal
                    el(
                        "div",
                        {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            },
                        },
                        // Côté gauche - Info météo
                        el(
                            "div",
                            {},
                            el(
                                "div",
                                {
                                    style: {
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        marginBottom: "4px",
                                    },
                                },
                                "Mahajanga, Madagascar"
                            ),
                            el(
                                "div",
                                {
                                    style: {
                                        fontSize: "32px",
                                        fontWeight: "bold",
                                        lineHeight: "1",
                                    },
                                },
                                "28°C"
                            ),
                            el(
                                "div",
                                {
                                    style: {
                                        fontSize: "14px",
                                        opacity: "0.9",
                                    },
                                },
                                "Ensoleillé"
                            )
                        ),

                        // Côté droit - Icône météo
                        el(
                            "div",
                            {
                                style: {
                                    fontSize: "48px",
                                    opacity: "0.8",
                                },
                            },
                            "☀️"
                        )
                    ),

                    // Détails en bas
                    el(
                        "div",
                        {
                            style: {
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "12px",
                                fontSize: "12px",
                                opacity: "0.8",
                            },
                        },
                        el("span", {}, "Humidité: 65%"),
                        el("span", {}, "Vent: 12 km/h")
                    )
                );
            }

            // Mode édition normal
            var currentDate = new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            return el(
                "div",
                {
                    className: "weather-block-editor-preview",
                },
                el("div", { className: "weather-date-preview" }, currentDate),
                el(
                    "div",
                    {
                        className: "weather-display-preview",
                    },
                    el(
                        "div",
                        { className: "weather-header-preview" },
                        el(
                            "h3",
                            { className: "weather-location-preview" },
                            "Votre ville, Pays"
                        )
                    ),
                    el(
                        "div",
                        { className: "weather-main-preview" },
                        el("div", { className: "weather-icon-preview" }, "☀️"),
                        el(
                            "div",
                            { className: "weather-temp-preview" },
                            "25°C"
                        ),
                        el(
                            "div",
                            { className: "weather-condition-preview" },
                            "Ensoleillé"
                        )
                    ),
                    el(
                        "div",
                        { className: "weather-details-preview" },
                        el(
                            "div",
                            { className: "weather-detail-preview" },
                            el("span", {}, "Humidité: 60%")
                        ),
                        el(
                            "div",
                            { className: "weather-detail-preview" },
                            el("span", {}, "Vent: 15 km/h N")
                        )
                    )
                ),
                el(
                    "p",
                    {
                        style: {
                            textAlign: "center",
                            marginTop: "10px",
                            fontSize: "12px",
                            color: "#666",
                            fontStyle: "italic",
                        },
                    },
                    __(
                        "Aperçu - La météo réelle sera affichée selon la géolocalisation",
                        "weather-block"
                    )
                )
            );
        },

        save: function (props) {
            return null; // Rendu côté serveur
        },
    });
})(
    window.wp.blocks,
    window.wp.i18n,
    window.wp.element,
    window.wp.components,
    window.wp.editor
);
