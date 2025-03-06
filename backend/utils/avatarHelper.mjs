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
const groupAvatars = [
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823370/1_yrwnhw.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823377/2_wan3mi.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823423/3_cnk4gb.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823446/4_j5rxuh.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823460/5_yguqoo.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823477/6_thgbyh.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823515/Mask_group_nt5bwf.png"
]
const projectAvatars = [
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823594/1_hr44zj.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823644/2_nc0c4j.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823669/3_xqayne.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823688/4_haeloc.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823703/5_fudurr.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823731/6_bvqjjy.png",
    "https://res.cloudinary.com/devteam3-gdsc/image/upload/v1740823767/7_hrxphf.png"
]

const getRandomAvatar = (type) => {
    return  type === "user"? avatars[Math.floor(Math.random() * avatars.length)] 
        :   type === "group" ? groupAvatars[Math.floor(Math.random() * groupAvatars.length)]
        :   projectAvatars[Math.floor(Math.random() * projectAvatars.length)];
};

export default getRandomAvatar