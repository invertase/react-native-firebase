import Chalk from 'chalk';
import { AndroidApp, IOSApp, ProjectDetail } from '../types/firebase';
import log from '../helpers/log';

export function getAndroidApp(
    projectDetail: ProjectDetail,
    packageName: string,
): AndroidApp | undefined {
    if (!projectDetail.apps.android?.length) {
        log.warn(`Your project ${projectDetail.displayName} does not contain any Android apps.`);
        return;
    } else {
        const selectedAndroidApp = projectDetail.apps.android.find(
            app => app.packageName === packageName,
        );

        if (!selectedAndroidApp) {
            log.warn(
                `Your project ${Chalk.cyanBright(
                    projectDetail.displayName,
                )} does not contain any Android apps that match the package name ${Chalk.cyanBright(
                    packageName,
                )}.`,
            );
            return;
        }
        return selectedAndroidApp;
    }
}

export function getIOSApp(projectDetail: ProjectDetail, bundleId: string): IOSApp | undefined {
    if (!projectDetail.apps.ios?.length) {
        log.warn(`Your project ${projectDetail.displayName} does not contain any iOS apps.`);
        return;
    }

    const selectedIOSApp = projectDetail.apps.ios?.find(app => app.bundleId === bundleId);

    if (!selectedIOSApp) {
        log.warn(
            `Your project ${Chalk.cyanBright(
                projectDetail.displayName,
            )} does not contain any IOS apps that match the package name ${Chalk.cyanBright(
                projectDetail.displayName,
            )}.`,
        );
        return;
    }
    return selectedIOSApp;
}
