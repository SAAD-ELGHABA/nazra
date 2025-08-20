import React from "react";
import { useTranslation } from "react-i18next";

const teamMembers = [
  {
    name: "Achraf Ouahmane",
    roleKey: "team.roles.leadDesigner",
    descriptionKey: "team.descriptions.achraf",
    image: "/OurTeam/Achraf.jpeg",
  },
  {
    name: "Adil Nmili",
    roleKey: "team.roles.productManager",
    descriptionKey: "team.descriptions.adil",
    image: "/OurTeam/Adil.jpeg",
  },
  {
    name: "Saad Elghaba",
    roleKey: "team.roles.marketingDirector",
    descriptionKey: "team.descriptions.saad",
    image: "/OurTeam/Saad.jpg",
  },
];

const OurTeam = () => {
  const { t } = useTranslation();

  return (
    <section className="md:p-10 p-4 bg-white">
      <div className="text-center mb-12">
        <p className="text-sm text-gray-500">{t("team.subtitle")}</p>
        <h2 className="text-3xl font-bold mt-2">{t("team.title")}</h2>
        <p className="text-gray-600 mt-2">{t("team.description")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="text-center">
            <img
              src={member.image}
              alt={member.name}
              className="w-20 h-20 mx-auto rounded-full object-cover"
            />
            <h3 className="font-bold mt-4">{member.name}</h3>
            <p className="text-sm text-gray-500">{t(member.roleKey)}</p>
            <p className="text-gray-600 mt-2 text-sm">{t(member.descriptionKey)}</p>
            <div className="flex justify-center mt-4 space-x-3 text-gray-600">
              <a href="#">
                <img
                  src="https://img.icons8.com/?size=100&id=13930&format=png&color=000000"
                  alt="linkedin"
                  className="h-6 w-6"
                />
              </a>
              <a href="#">
                <img
                  src="https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000"
                  alt="linkedin"
                  className="h-6 w-6"
                />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurTeam;
