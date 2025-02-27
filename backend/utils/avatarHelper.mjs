const avatars = [
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648066/6_esaio5.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648118/1_mnkd5m.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648133/2_chyds1.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648152/4_asqjsw.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648157/5_ckdpo6.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648190/7_fyt4kj.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648196/8_abinko.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648205/9_xir1x6.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648245/10_uusknd.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648248/11_ax0h6o.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740648276/12_sdiadm.png"


];

const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return avatars[randomIndex];
};

export default getRandomAvatar