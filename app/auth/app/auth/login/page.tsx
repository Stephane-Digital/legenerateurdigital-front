// ❌ mauvais
import { api, getToken, setToken, clearToken } from '@app/lib/api';
// ou
import { api } from '@/app/lib/api';

// ✅ bon
import { api, getToken, setToken, clearToken } from '@/lib/api';
