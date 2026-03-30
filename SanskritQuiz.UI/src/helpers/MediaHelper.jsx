export default class MediaHelper {
    static API = import.meta.env.VITE_API_BASE_URL;

    static resolveMedia = (url) => {
        if (!url) return '';
        if (url.startsWith('media://')) {
            return `${MediaHelper.API}/api/media/${url.replace('media://', '')}`;
        }
        return url;
    };
}