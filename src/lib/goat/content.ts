export const brand = { name: 'GOAT’99', credit: 'Application et site web conçus et développés par Nuvex Technology' };
export const defaultCampaign = {
 title: 'L’allure est\nune signature.',
 description: 'Un regard singulier. Une élégance sans compromis.\nEntrez dans l’univers GOAT’99.',
 primary_label: 'Découvrir la boutique',
 secondary_label: 'Voir les articles en vedette',
};
export const pages: Record<string, {title:string; eyebrow:string; description:string}> = {
 maison:{title:'La Maison',eyebrow:'L’esprit GOAT’99',description:'Une expression contemporaine de la mode, entre caractère, élégance et liberté.'},
 collections:{title:'Les collections',eyebrow:'L’univers GOAT’99',description:'Le vestiaire, les objets et les détails qui dessinent l’univers de la Maison.'},
 joaillerie:{title:'Joaillerie',eyebrow:'L’art du détail',description:'Une vision de la joaillerie à découvrir au fil des prochaines éditions.'},
 horlogerie:{title:'Horlogerie',eyebrow:'Le temps, autrement',description:'L’univers horloger de la Maison. Les pièces seront présentées après validation du catalogue.'},
 'editions-limitees':{title:'Éditions limitées',eyebrow:'Expressions singulières',description:'Les éditions de la Maison seront annoncées ici à leur publication.'},
 'sur-mesure':{title:'Sur mesure',eyebrow:'Une expression personnelle',description:'Les modalités du service sur mesure et des précommandes seront annoncées prochainement.'},
 evenements:{title:'Les événements',eyebrow:'Les rendez-vous de la Maison',description:'Défilés, rencontres et expériences GOAT’99. Les invitations seront dévoilées après confirmation des événements.'},
 journal:{title:'Le Journal',eyebrow:'Regards de la Maison',description:'Création, inspirations et conversations. Les premières publications sont en préparation.'},
 contact:{title:'Services clients',eyebrow:'À votre écoute',description:'Les coordonnées officielles et les horaires du service clients seront communiqués avant l’ouverture commerciale.'},
 confidentialite:{title:'Politique de confidentialité',eyebrow:'Vos données personnelles',description:'GOAT’99 utilise Lovable Cloud pour gérer les comptes et les profils clients. La connexion partage les informations d’identité autorisées. Les coordonnées du responsable de traitement, les durées de conservation et la procédure d’exercice des droits doivent encore être validées avant l’ouverture publique.'},
 'mentions-legales':{title:'Mentions légales',eyebrow:'Informations légales',description:'Application et site web conçus et développés par Nuvex Technology. L’identité juridique de l’éditeur GOAT’99, son adresse, son immatriculation et les coordonnées de contact restent à fournir avant publication.'},
 conditions:{title:'Conditions de vente',eyebrow:'Informations commerciales',description:'Les prix, devises, taxes, zones de livraison, délais, retours, remboursements et conditions de billetterie ne sont pas encore validés. Aucune vente ni réservation payante n’est ouverte.'},
 livraison:{title:'Livraison & retours',eyebrow:'Services de la Maison',description:'Les zones de livraison, tarifs et modalités de retour seront précisés avant l’ouverture de la boutique.'},
 entretien:{title:'Entretien & guide des tailles',eyebrow:'Le soin des pièces',description:'Les conseils d’entretien et guides de tailles seront associés à chaque pièce publiée.'},
};
export function metadata(title:string, description:string) { return {meta:[{title:`${title} — GOAT’99`},{name:'description',content:description},{property:'og:title',content:`${title} — GOAT’99`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}; }
