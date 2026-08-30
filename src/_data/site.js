// Global site constants — the "un fisier de constante" pattern extended
// beyond just colors: phone/email/address/hours/social/keys used across
// all 3 pages now live here once, instead of being retyped in each
// contact section and each <meta> block.
//
// Available in any template as {{ site.xxx }}.
module.exports = {
  companyName: "Caloric",
  phone: "+40 744 502 692",
  phoneHref: "tel:+40744502692",
  whatsappHref: "https://wa.me/40744502692",
  email: "caloricfrig@yahoo.com",
  address: "Bd. Dorobantilor 466, Brăila",
  addressFull: "Bd. Dorobanților 466, 810091 Brăila",
  hours: {
    weekdays: "Luni - Vineri: 08:00 - 17:00",
    weekend: "Sâmbătă - Duminică: Închis",
  },
  facebookUrl: "https://www.facebook.com/people/Caloric/100083597462753/",
  facebookPagePluginSrc:
    "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100083597462753&tabs=timeline&width=360&height=480&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false",
  mapEmbedSrc:
    "https://www.google.com/maps?q=Bd.%20Dorobantilor%20466%2C%20Br%C4%83ila%2C%20Romania&output=embed",
  web3formsAccessKey: "b88e84eb-a1e4-42fc-b390-1f04e5352c5d",
  googleRating: {
    value: "4.8",
    count: 11,
  },
};
