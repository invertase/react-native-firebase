import { AndroidApp, ProjectDetail } from '../types/firebase';

export default function validateGoogleServices(
  googleServicesJson: string,
  projectDetail: ProjectDetail,
  selectedAndroidApp: AndroidApp,
): string | undefined {
  try {
    const googleServicesInfo = JSON.parse(googleServicesJson);

    const projectInfo = googleServicesInfo.project_info;
    if (projectInfo.project_number != projectDetail.projectNumber) return 'Project number mismatch';
    if (projectInfo.project_id != projectDetail.projectId) return 'Project ID mismatch';

    const client = (googleServicesInfo.client as any[]).find(
      entry => entry.client_info.mobilesdk_app_id == selectedAndroidApp.appId,
    );
    if (!client) return 'Client missing for App';
    if (client.client_info.android_client_info.package_name != selectedAndroidApp.packageName)
      return 'Package name mismatch';
  } catch (e) {
    return 'Invalid format';
  }
}
