const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/profile");
const User = require("../../models//userModel");
const { check, validationResult } = require("express-validator");

//@routr   api/profile/me
//@desc    get current user profile
//@access  Public

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).
            populate('User', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }
        res.json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error')

    }
})

//@routr   api/profile/
//@desc    create or update user profile
//@access  Private

router.post('/', [auth, [
    check('status', 'Status is required')
        .not().isEmpty(),
    check('skills', 'Skill is required').not().isEmpty()
]], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;
    // build profile object
    const profileFields = {}
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    // build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (profile) {
            //update
            profile = await Profile.findOneAndUpdate({ user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }
        // create
        profile = new Profile(profileFields);
        await profile.save();
        console.log(profile)
        res.json(profile);

    } catch (err) {
        console.error(err.message)
        res.status(500).send('server Error');
    }

})
//@routr   api/profile/
//@desc    get profile data
//@access  Private

router.get('/', auth, async (req, res) => {
    try {
        const profiles = await Profile.find().populate('User', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error in route /')

    }
})
//@routr   api/profile/user/user_id
//@desc    get profile by user id
//@access  piblic

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            res.status(500).send('There is no profile of this ID')
        }
    }
})
//@routr   DELETE api/profile
//@desc    Delete profile, user & posts
//@access  piblic

router.delete('/', auth, async (req, res) => {
    try {
        // @todo -remove users posts


        // Remove profile
        // await Profile .deleteOne({user: req.user.id})
        await Profile.deleteOne({ user: req.user.id }, (err) => {
            if (!err) {
                res.json({ msg: 'Profile Deleted' })
            }
            else {
                res.json({ msg: 'error in deleting' })
            }
        })
        // Remove User
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User Deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})
//@routr   PUT api/profile/experience
//@desc    Add profile experience
//@access  private

router.put('/experience',
    [
        auth,
        [
            check('title', "Title is required").
                not().isEmpty(),
            check('company', 'Company is required').not().
                isEmpty(),
            check('from', 'From is required')

        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp);


            await profile.save();

            res.json(profile)

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error **********')
        }

    })

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // get remove index
        const removeIndex = profile.experience.map(item => item.id).
            indexOf(req.params.id);
        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
})
//@routr   PUT api/profile/education
//@desc    Add profile experience
//@access  private

router.put('/education',
    [
        auth,
        [
            check('degree', "Degree is required").
                not().isEmpty(),
            check('fieldofstudy', 'Field of study is required').not().
                isEmpty(),
            check('from', 'From is required')

        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body;

        const newEducation = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(newEducation);
            await profile.save();

            res.json(profile)

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error while adding education')
        }

    })

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // get remove index
        const removeIndex = profile.education.map(item => item.id).
            indexOf(req.params.id);
        profile.education.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
})
//@routr   GET api/github/:username 
//@desc    Add profile experience
//@access  private

module.exports = router;