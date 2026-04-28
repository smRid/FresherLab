import sql from "../config/db.js";

export const getUserCreations = async (req, res)=>{
    try {
        const {userId} = req.auth()

        const creations = await sql `SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

        res.json({ success: true, creations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getPublishedCreations = async (req, res)=>{
    try {
        const creations = await sql`
            SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

        res.json({ success: true, creations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const toggleLikeCreation = async (req, res)=>{
    try {

        const { userId } = req.auth()
        const { id } = req.body

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`

        if(!creation){
            return res.status(404).json({ success: false, message: "Creation not found" })
        }

        const currentLikes = creation.likes;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user)=>user !== userIdStr);
            message = 'Creation Unliked'
        } else{
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creation Liked'
        }

        const formattedArray = `{${updatedLikes.map(like => `"${like}"`).join(',')}}`

        await sql `UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// ─── Job Application Tracker CRUD ─────────────────────────────────

export const getJobApplications = async (req, res) => {
    try {
        const { userId } = req.auth();
        const jobs = await sql`SELECT * FROM job_applications WHERE user_id = ${userId} ORDER BY created_at DESC`;
        res.json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const createJobApplication = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { company, role, status, job_url, location, salary_range, source, contact_name, contact_email, notes, follow_up_date } = req.body;
        if (!company || !role) return res.status(400).json({ success: false, message: "Company and role are required." });

        const [job] = await sql`
            INSERT INTO job_applications (user_id, company, role, status, job_url, location, salary_range, source, contact_name, contact_email, notes, follow_up_date)
            VALUES (${userId}, ${company}, ${role}, ${status || 'Applied'}, ${job_url || null}, ${location || null}, ${salary_range || null}, ${source || null}, ${contact_name || null}, ${contact_email || null}, ${notes || null}, ${follow_up_date || null})
            RETURNING *
        `;
        res.json({ success: true, job, message: "Application added" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const updateJobApplication = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;
        const { company, role, status, job_url, location, salary_range, source, contact_name, contact_email, notes, follow_up_date } = req.body;
        if (!company || !role) return res.status(400).json({ success: false, message: "Company and role are required." });

        const [job] = await sql`
            UPDATE job_applications
            SET company = ${company}, role = ${role}, status = ${status || 'Applied'},
                job_url = ${job_url || null}, location = ${location || null}, salary_range = ${salary_range || null},
                source = ${source || null}, contact_name = ${contact_name || null}, contact_email = ${contact_email || null},
                notes = ${notes || null}, follow_up_date = ${follow_up_date || null}, updated_at = NOW()
            WHERE id = ${id} AND user_id = ${userId}
            RETURNING *
        `;
        if (!job) return res.status(404).json({ success: false, message: "Application not found." });
        res.json({ success: true, job, message: "Application updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteJobApplication = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;

        const result = await sql`DELETE FROM job_applications WHERE id = ${id} AND user_id = ${userId}`;
        if (result.count === 0) return res.status(404).json({ success: false, message: "Application not found." });
        res.json({ success: true, message: "Application deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}