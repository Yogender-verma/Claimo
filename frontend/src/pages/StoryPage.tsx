import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { extractStoryFacts, UserProfileFacts } from '../lib/api';

const SAMPLE_PROMPTS = [
  {
    lang: 'te',
    label: 'తెలుగు ఉదాహరణ 1',
    text: 'నేను ఇంటర్మీడియట్ మొదటి సంవత్సరం చదువుతున్నాను. మా కుటుంబ వార్షిక ఆదాయం లక్ష రూపాయలు. మేము ఎస్సీ కులానికి చెందినవారము.',
  },
  {
    lang: 'te',
    label: 'తెలుగు ఉదాహరణ 2',
    text: 'నేను డిగ్రీ మొదటి సంవత్సరం చదువుతున్నాను. మా నాన్నగారి నెల ఆదాయం పది వేల రూపాయలు. మాది ST కేటగిరీ.',
  },
  {
    lang: 'en',
    label: 'English Example 1',
    text: 'My son is studying polytechnic diploma 2nd year. Monthly family income is 15000. BC category in Warangal.',
  },
  {
    lang: 'en',
    label: 'English Example 2',
    text: 'I am in Intermediate MPC. Family annual income is two lakhs per year. SC category.',
  },
];

const TELANGANA_DISTRICTS = [
  'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial',
  'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy',
  'Karimnagar', 'Khammam', 'Kumuram Bheem Asifabad', 'Mahabubabad',
  'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Mulugu',
  'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad',
  'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy',
  'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
];

const StoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [storyText, setStoryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Extracted and confirmed profile facts
  const [profile, setProfile] = useState<UserProfileFacts | null>(null);
  const [missingPeriodError, setMissingPeriodError] = useState(false);

  // Load existing profile from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem('claimo_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    }
  }, []);

  // Web Speech API handler
  const handleMicToggle = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Voice input is not supported in this browser. You can type or paste your story.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = i18n.language === 'te' ? 'te-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setStoryText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = (err: any) => {
        setIsRecording(false);
        setSpeechError(`Voice error: ${err.error || 'Could not record speech. Please type instead.'}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      setSpeechError('Could not start microphone. Please check permissions or type your story.');
    }
  };

  const handleExtract = async () => {
    if (!storyText.trim()) return;
    setLoading(true);
    setError(null);
    setMissingPeriodError(false);

    try {
      const facts = await extractStoryFacts(storyText);
      setProfile(facts);
      // Auto-save to localStorage
      localStorage.setItem('claimo_user_profile', JSON.stringify(facts));
    } catch (err: any) {
      setError(err.message || 'Error extracting facts. Please try again or fill in the details manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    localStorage.removeItem('claimo_user_profile');
    setProfile(null);
    setStoryText('');
    setError(null);
    setMissingPeriodError(false);
  };

  const handleProceedToMatches = () => {
    if (!profile) return;

    // Strict validation: if income_amount is set, income_period MUST be confirmed ('month' or 'year')
    if (profile.income_amount != null && !profile.income_period) {
      setMissingPeriodError(true);
      return;
    }

    // Save final confirmed profile to localStorage
    localStorage.setItem('claimo_user_profile', JSON.stringify(profile));
    navigate('/matches');
  };

  const updateProfileField = (field: keyof UserProfileFacts, val: any) => {
    if (!profile) return;
    const updated = { ...profile, [field]: val };
    // Synchronize to facts dict
    if (field === 'caste' || field === 'current_course' || field === 'district' || field === 'marks_percentage') {
      updated.facts = { ...updated.facts, [field]: val };
    }
    setProfile(updated);
    if (field === 'income_period' && val) {
      setMissingPeriodError(false);
    }
    localStorage.setItem('claimo_user_profile', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-alt-bg dark:bg-dark-bg flex flex-col justify-between">
      <Header />

      <main className="max-w-content mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Page Title & Privacy Pill */}
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-teal-light dark:bg-dark-hero text-teal dark:text-dark-teal">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>100% Private & Anonymous • Zero ID Numbers Stored</span>
            </span>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink dark:text-dark-text">
              Tell your story in your own words
            </h1>
            <p className="text-sm text-muted dark:text-dark-muted max-w-lg mx-auto">
              Type or speak in Telugu or English. We will extract only the facts needed to match schemes.
            </p>
          </div>

          {/* Sample Prompts */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
              Try a sample story:
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStoryText(sample.text)}
                  className="text-xs text-left px-3 py-1.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text hover:border-teal dark:hover:border-dark-teal transition-colors"
                >
                  <span className="font-medium text-teal dark:text-dark-teal mr-1">{sample.label}:</span>
                  <span className="truncate max-w-[200px] inline-block align-bottom">{sample.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Story Input Area */}
          <div className="claimo-card p-4 sm:p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border space-y-4">
            <div className="relative">
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value.slice(0, 1000))}
                rows={4}
                placeholder={
                  i18n.language === 'te'
                    ? 'ఉదాహరణ: నేను ఇంటర్మీడియట్ మొదటి సంవత్సరం. కుటుంబ వార్షిక ఆదాయం లక్ష రూపాయలు, ఎస్సీ కేటగిరీ...'
                    : 'Example: I am in Intermediate 1st year. Family annual income is ₹1,00,000, SC category...'
                }
                className="w-full p-3.5 text-sm sm:text-base rounded-xl border border-border dark:border-dark-border bg-alt-bg dark:bg-dark-bg text-ink dark:text-dark-text placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-teal dark:focus:ring-dark-teal resize-none"
              />
              <div className="flex items-center justify-between text-xs text-muted dark:text-dark-muted mt-2">
                <span>{storyText.length} / 1000 characters</span>
                {storyText.length >= 1000 && (
                  <span className="text-accent dark:text-dark-accent font-semibold">Maximum character limit reached</span>
                )}
              </div>
            </div>

            {/* Speech recognition error message */}
            {speechError && (
              <div className="p-3 text-xs rounded-lg bg-accent-soft/40 dark:bg-dark-accent-soft text-accent-dark dark:text-dark-accent-text flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{speechError}</span>
              </div>
            )}

            {/* Controls: Voice & Extract Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleMicToggle}
                aria-label={isRecording ? 'Stop voice recording' : 'Record story with voice'}
                className={`btn-secondary flex items-center justify-center gap-2 text-sm py-2.5 ${
                  isRecording ? 'border-red-500 text-red-600 animate-pulse' : ''
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>{isRecording ? 'Listening... (Click to stop)' : 'Speak story (Voice)'}</span>
              </button>

              <button
                type="button"
                onClick={handleExtract}
                disabled={loading || !storyText.trim()}
                className="btn-primary flex items-center justify-center gap-2 text-sm py-2.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white dark:border-dark-bg border-t-transparent rounded-full animate-spin" />
                    <span>Extracting Facts...</span>
                  </>
                ) : (
                  <>
                    <span>Extract Facts</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="claimo-card p-6 bg-white dark:bg-dark-card border border-border dark:border-dark-border animate-pulse space-y-4">
              <div className="h-5 bg-border dark:bg-dark-border rounded w-1/3" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-border dark:bg-dark-border rounded" />
                <div className="h-10 bg-border dark:bg-dark-border rounded" />
              </div>
              <div className="h-10 bg-border dark:bg-dark-border rounded w-full" />
            </div>
          )}

          {/* ================================================== */}
          {/* CONFIRMATION CARD (THE CRUCIAL TRUST SCREEN) */}
          {/* ================================================== */}
          {profile && !loading && (
            <div className="claimo-card p-5 sm:p-8 bg-white dark:bg-dark-card border-2 border-teal dark:border-dark-teal space-y-6 shadow-sm">
              
              {/* Trust Guarantee Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal dark:text-dark-teal">
                    Step 2: Fact Confirmation
                  </span>
                  <button
                    type="button"
                    onClick={handleClearData}
                    className="text-xs text-muted hover:text-red-500 underline"
                  >
                    Clear my data
                  </button>
                </div>
                <h2 className="font-heading font-bold text-xl text-ink dark:text-dark-text">
                  These are the facts we found
                </h2>
                <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">
                  Change anything that is wrong. We evaluate eligibility using only these confirmed facts.
                </p>
              </div>

              {/* Telugu number notice */}
              {profile.telugu_number_flagged && (
                <div className="p-3 rounded-lg bg-accent-soft/40 dark:bg-dark-accent-soft border border-accent/20 dark:border-dark-accent/20 text-xs text-accent-dark dark:text-dark-accent-text flex items-center gap-2">
                  <span className="text-base font-bold">ℹ️</span>
                  <span>We interpreted Telugu number words into ₹{profile.income_amount?.toLocaleString('en-IN')}. Please verify below.</span>
                </div>
              )}

              {/* 1. Applying For Toggle */}
              <div className="p-4 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border space-y-2">
                <label className="text-xs font-semibold text-ink dark:text-dark-text block">
                  Who is applying?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateProfileField('applying_for', 'me')}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      profile.applying_for === 'me'
                        ? 'border-teal bg-teal text-white dark:bg-dark-teal dark:text-dark-bg'
                        : 'border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text'
                    }`}
                  >
                    Myself (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProfileField('applying_for', 'child')}
                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                      profile.applying_for === 'child'
                        ? 'border-teal bg-teal text-white dark:bg-dark-teal dark:text-dark-bg'
                        : 'border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text'
                    }`}
                  >
                    My Child
                  </button>
                </div>
              </div>

              {/* 2. Income Amount & Mandatory Period Toggle */}
              <div className={`p-4 rounded-xl border transition-all ${
                missingPeriodError
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                  : 'border-border dark:border-dark-border bg-alt-bg dark:bg-dark-bg'
              } space-y-3`}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-ink dark:text-dark-text">
                    Family Income (Amount & Period)
                  </label>
                  {profile.income_amount != null && !profile.income_period && (
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 animate-bounce">
                      Required: Select Month or Year
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted dark:text-dark-muted mb-1 block">Amount (₹)</span>
                    <input
                      type="number"
                      value={profile.income_amount ?? ''}
                      placeholder="e.g. 150000"
                      onChange={(e) => updateProfileField('income_amount', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full p-2.5 text-sm rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text focus:ring-2 focus:ring-teal dark:focus:ring-dark-teal"
                    />
                  </div>

                  <div>
                    <span className="text-xs text-muted dark:text-dark-muted mb-1 block">Frequency / Period</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateProfileField('income_period', 'month')}
                        className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                          profile.income_period === 'month'
                            ? 'border-teal bg-teal text-white dark:bg-dark-teal dark:text-dark-bg font-semibold'
                            : 'border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text hover:border-teal'
                        }`}
                      >
                        Per Month
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProfileField('income_period', 'year')}
                        className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                          profile.income_period === 'year'
                            ? 'border-teal bg-teal text-white dark:bg-dark-teal dark:text-dark-bg font-semibold'
                            : 'border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text hover:border-teal'
                        }`}
                      >
                        Per Year
                      </button>
                    </div>
                  </div>
                </div>

                {missingPeriodError && (
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Schemes calculate eligibility strictly on annual income. Please choose whether ₹{profile.income_amount} is per month or per year.
                  </p>
                )}
              </div>

              {/* 3. Category / Caste Chip Selector */}
              <div className="p-4 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border space-y-2">
                <label className="text-xs font-semibold text-ink dark:text-dark-text block">
                  Category / Caste
                </label>
                <div className="flex flex-wrap gap-2">
                  {['SC', 'ST', 'BC', 'OC', 'Minority'].map((casteOpt) => (
                    <button
                      key={casteOpt}
                      type="button"
                      onClick={() => updateProfileField('caste', profile.caste === casteOpt ? null : casteOpt)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        profile.caste === casteOpt
                          ? 'border-teal bg-teal text-white dark:bg-dark-teal dark:text-dark-bg font-semibold'
                          : 'border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text'
                      }`}
                    >
                      {casteOpt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Current Course */}
              <div className="p-4 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border space-y-2">
                <label className="text-xs font-semibold text-ink dark:text-dark-text block">
                  Current Course / Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'polytechnic', label: 'Polytechnic' },
                    { id: 'degree', label: 'Degree' },
                    { id: 'engineering', label: 'Engineering' },
                  ].map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => updateProfileField('current_course', profile.current_course === course.id ? null : course.id)}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                        profile.current_course === course.id
                          ? 'border-teal bg-teal text-white dark:bg-dark-teal dark:text-dark-bg font-semibold'
                          : 'border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text'
                      }`}
                    >
                      {course.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. District */}
              <div className="p-4 rounded-xl bg-alt-bg dark:bg-dark-bg border border-border dark:border-dark-border space-y-2">
                <label className="text-xs font-semibold text-ink dark:text-dark-text block">
                  District in Telangana
                </label>
                <select
                  value={profile.district || ''}
                  onChange={(e) => updateProfileField('district', e.target.value || null)}
                  className="w-full p-2.5 text-sm rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-card text-ink dark:text-dark-text focus:ring-2 focus:ring-teal dark:focus:ring-dark-teal"
                >
                  <option value="">Select district (optional)</option>
                  {TELANGANA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleProceedToMatches}
                  className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
                >
                  <span>See Eligible Schemes</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <div className="text-center text-xs text-muted dark:text-dark-muted">
                  Matches are calculated deterministically on official criteria.
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      <footer className="w-full bg-white dark:bg-dark-bg border-t border-border dark:border-dark-border py-6 px-6 text-center text-xs text-muted dark:text-dark-muted">
        {t('footer.text')}
      </footer>
    </div>
  );
};

export default StoryPage;
