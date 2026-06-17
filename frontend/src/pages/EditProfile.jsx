import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import { User, GraduationCap, FileText, Upload, CheckCircle2, AlertCircle, Loader } from 'lucide-react';

const Github = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const EditProfile = () => {
  const { user, fetchMe } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('branch', user.branch || '');
      setValue('year', user.year || 1);
      setValue('bio', user.bio || '');
      setValue('github_link', user.github_link || '');
      // Format skills list into comma separated string
      const skillsStr = user.skills?.map(s => s.skill_name).join(', ') || '';
      setValue('skills', skillsStr);
    }
  }, [user]);

  const onSubmit = async (data) => {
    setMsg({ text: '', type: '' });
    setSubmitting(true);
    try {
      // Split skills string back to array of trimmed strings
      const skillsArr = data.skills
        ? data.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const payload = {
        name: data.name,
        branch: data.branch,
        year: parseInt(data.year),
        bio: data.bio,
        github_link: data.github_link,
        skills: skillsArr
      };

      await api.put('/api/users/profile/update', payload);
      await fetchMe();
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      // Go back to profile page after 1.5s
      setTimeout(() => {
        navigate(`/profile/${user.id}`);
      }, 1500);
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to update profile details.';
      setMsg({ text: errMsg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setMsg({ text: '', type: '' });
    setUploadingAvatar(true);

    try {
      await api.post('/api/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchMe();
      setMsg({ text: 'Profile picture uploaded successfully!', type: 'success' });
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to upload image avatar.';
      setMsg({ text: errMsg, type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setMsg({ text: '', type: '' });
    setUploadingResume(true);

    try {
      await api.post('/api/users/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchMe();
      setMsg({ text: 'Resume document uploaded successfully!', type: 'success' });
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Failed to upload resume document.';
      setMsg({ text: errMsg, type: 'error' });
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 px-4 text-brutal-charcoal">
      <div>
        <h1 className="font-serif text-3xl font-black tracking-tight text-brutal-charcoal dark:text-white uppercase">
          Edit Profile
        </h1>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
          Modify your personal information, upload visual assets, and manage skills.
        </p>
      </div>

      {msg.text && (
        <div className={`flex items-center space-x-2 rounded-none border-2 border-brutal-charcoal p-4 text-sm font-bold ${
          msg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
            : 'bg-brutal-red/10 text-brutal-red'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatars & Resumes uploads */}
        <div className="md:col-span-1 space-y-6">
          {/* Avatar box */}
          <div className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm text-center space-y-4">
            <h3 className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Profile Photo</h3>
            <div className="flex flex-col items-center">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture.startsWith('http') ? user.profile_picture : `${API_BASE_URL}${user.profile_picture}`}
                  alt={user?.name}
                  className="h-24 w-24 rounded-none object-cover border-2 border-brutal-charcoal"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-none border-2 border-brutal-charcoal bg-brutal-yellow text-4xl font-black text-brutal-charcoal">
                  {user?.name.charAt(0)}
                </div>
              )}
              
              <label className="mt-4 inline-flex items-center space-x-1.5 rounded-none border-2 border-brutal-charcoal bg-white px-3 py-2 text-xs font-bold text-brutal-charcoal cursor-pointer hover:bg-brutal-yellow dark:border-white dark:bg-darkBg dark:text-white transition-all">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
                <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          {/* Resume Upload box */}
          <div className="rounded-none border-2 border-brutal-charcoal bg-white p-5 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm text-center space-y-4">
            <h3 className="text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">Placement Resume</h3>
            <div className="flex flex-col items-center space-y-2">
              <FileText className={`h-12 w-12 ${user?.resume_url ? 'text-brutal-red' : 'text-gray-300'}`} />
              <p className="text-[10px] font-bold text-gray-400">PDF, DOC, or DOCX formats</p>
              
              <label className="mt-2 inline-flex items-center space-x-1.5 rounded-none border-2 border-brutal-charcoal bg-white px-3 py-2 text-xs font-bold text-brutal-charcoal cursor-pointer hover:bg-brutal-yellow dark:border-white dark:bg-darkBg dark:text-white transition-all">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingResume ? 'Uploading...' : user?.resume_url ? 'Update Resume' : 'Upload Resume'}</span>
                <input type="file" onChange={handleResumeChange} className="hidden" accept=".pdf,.doc,.docx" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Text fields form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-none border-2 border-brutal-charcoal bg-white p-6 shadow-brutal-sm dark:border-white dark:bg-darkCard dark:shadow-brutal-dark-sm space-y-6">
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 px-3 text-sm font-bold text-brutal-charcoal focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] dark:border-white dark:bg-darkBg dark:text-white dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600 font-bold">{errors.name.message}</p>}
            </div>

            {/* Branch and Year */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="branch" className="block text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">
                  Branch
                </label>
                <input
                  id="branch"
                  type="text"
                  {...register('branch', { required: 'Branch is required' })}
                  className="mt-1 block w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 px-3 text-sm font-bold text-brutal-charcoal focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] dark:border-white dark:bg-darkBg dark:text-white dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all"
                />
                {errors.branch && <p className="mt-1 text-xs text-red-600 font-bold">{errors.branch.message}</p>}
              </div>

              <div>
                <label htmlFor="year" className="block text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">
                  Year of Study
                </label>
                <select
                  id="year"
                  {...register('year')}
                  className="mt-1 block w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 px-3 text-sm font-bold text-brutal-charcoal focus:outline-none dark:border-white dark:bg-darkBg dark:text-white"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>
            </div>

            {/* GitHub Profile */}
            <div>
              <label htmlFor="github_link" className="block text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">
                GitHub URL
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Github className="h-4 w-4 text-brutal-charcoal dark:text-gray-400" />
                </div>
                <input
                  id="github_link"
                  type="url"
                  {...register('github_link')}
                  placeholder="https://github.com/your-username"
                  className="block w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 pl-10 pr-3 text-sm font-bold text-brutal-charcoal focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] dark:border-white dark:bg-darkBg dark:text-white dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all"
                />
              </div>
            </div>

            {/* Skills tags list */}
            <div>
              <label htmlFor="skills" className="block text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">
                Skills & Technologies (Comma-Separated)
              </label>
              <input
                id="skills"
                type="text"
                {...register('skills')}
                placeholder="Python, React, Machine Learning, Graphic Design"
                className="mt-1 block w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 px-3 text-sm font-bold text-brutal-charcoal focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] dark:border-white dark:bg-darkBg dark:text-white dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all"
              />
              <p className="mt-1 text-[10px] font-bold text-gray-500">Separate skills using commas. Example: Java, React, Photoshop</p>
            </div>

            {/* Biography */}
            <div>
              <label htmlFor="bio" className="block text-xs font-black text-brutal-charcoal dark:text-white uppercase tracking-wider">
                Profile Biography
              </label>
              <textarea
                id="bio"
                rows={4}
                {...register('bio')}
                placeholder="Tell other students about your experience, achievements, services, and what you offer..."
                className="mt-1 block w-full rounded-none border-2 border-brutal-charcoal bg-white py-2.5 px-3 text-sm font-bold text-brutal-charcoal focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_rgba(17,17,17,1)] dark:border-white dark:bg-darkBg dark:text-white dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate(`/profile/${user?.id}`)}
                className="rounded-none border-2 border-brutal-charcoal bg-white px-4 py-2.5 text-sm font-bold text-brutal-charcoal hover:bg-gray-100 dark:border-white dark:bg-darkBg dark:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="brutal-btn-yellow px-6 py-2.5 text-sm rounded-none border-2 border-brutal-charcoal focus:outline-none disabled:opacity-75"
              >
                {submitting ? <Loader className="h-5 w-5 animate-spin" /> : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
