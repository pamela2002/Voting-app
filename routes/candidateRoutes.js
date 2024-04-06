const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');


const checkAdminRole = async (userId) => {
    try {
        const user = await User.findOne({ _id: userId });
        if (user.role === 'admin') {
            return true;
        }
    } catch (err) {
        return false;
    }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.userData.id)) {
            return res.status(403).json({ message: "user does not have admin role" });
        }
        const data = req.body // Assuming the request body contains the user data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response:response})

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})





router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {

        if (! await checkAdminRole(req.user.userData.id)) {
            return res.status(403).json({ message: "user does not have admin role" });
        }

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {

        if (! await checkAdminRole(req.user.userData.id)) {
            return res.status(403).json({ message: "user does not have admin role" });
        }

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate deleted');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// let's start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    // no admin can vote
    // user can only vote once

    const candidateID = req.params.candidateID;
    const userId = req.user.userData.id;

    try {
        // Find the candidate document with specific candidateID
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({message: 'candidate not found'})
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'user not found' })
        }
        if (user.isVoted) {
            res.status(404).json({message: 'You have already voted'})
        }
        if (user.role === 'admin') {
            res.status(403).json({ message: 'admin is not allowed' });
        }
        // Update candifdate document to record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        res.status(200).json({message: 'vote recorded successfully'})
        

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

// vote count 
router.get('/vote/count', async (req, res) => {
    try {
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;