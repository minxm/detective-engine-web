import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CinematicBackdrop from '@/components/CinematicBackdrop';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAuthStore } from '@/hooks/useAuthStore';
import { validateWechatState } from '@/lib/wechat-auth';
import { t } from '@/i18n/zh';
import { parseAuthError } from '@/utils/authError';

export default function WechatCallbackPage() {
  const navigate = useNavigate();
  const completeWechatLogin = useAuthStore((s) => s.completeWechatLogin);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const providerError = params.get('error_description') || params.get('error');

    if (providerError) {
      setError(parseAuthError(providerError, t.auth.wechatFailed));
      return;
    }

    if (!code || !validateWechatState(state)) {
      setError(t.auth.wechatInvalidCallback);
      return;
    }

    void completeWechatLogin(code)
      .then(() => navigate('/lobby', { replace: true }))
      .catch((err) => setError(parseAuthError(err, t.auth.wechatFailed)));
  }, [completeWechatLogin, navigate]);

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 bg-spec-black">
        <CinematicBackdrop />
        <div className="relative z-10 max-w-md text-center space-y-4">
          <p className="font-mono text-sm text-spec-red">{error}</p>
          <button
            type="button"
            className="font-mono text-xs text-spec-cyan underline"
            onClick={() => navigate('/auth', { replace: true })}
          >
            {t.auth.wechatRetry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-spec-black">
      <CinematicBackdrop />
      <LoadingScreen label={t.auth.wechatCompleting} />
    </div>
  );
}
