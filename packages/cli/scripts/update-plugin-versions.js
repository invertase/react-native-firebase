const fetch = require('node-fetch');
const isGitDirty = require('is-git-dirty');

const repo = 'google';
const versionsFile = 'plugin-versions.json';

// returns true if version a > b
function compareVersion(a, b) {
    const va = a.split('.').map(i => +i),
        vb = b.split('.').map(i => +i);
    for (let i = 0; ; i++) {
        if (i == va.length) return false;
        if (i == vb.length) return true;

        if (va[i] > vb[i]) return true;
        if (va[i] < vb[i]) return false;
    }
}

async function getMavenVersions(namespace, plugin) {
    try {
        const response = await fetch(
            `https://mvnrepository.com/artifact/${namespace}/${plugin}?repo=${repo}`,
        );
        const pageText = await response.text();
        const versionPattern = new RegExp(
            `<td><a href="${plugin}\/([0-9.]+)" class="vbtn release">\\1<\/a><\/td>`,
            'g',
        );
        const versionMatches = pageText.matchAll(versionPattern);
        const versions = [...versionMatches].map(match => match[1]);
        if (!versions.length) throw new Error('No versions found');
        return versions;
    } catch (e) {
        console.error(
            `Unable to fetch version information for ${namespace}:${plugin}: ${e.message}`,
        );
        return null;
    }
}

const repoDirty = isGitDirty();
if (repoDirty) {
    console.warn(
        'You have uncomitted files, please stash or commit your changes. Script will now write to console instead of file.',
    );
}

const oldVersions = require(`../${versionsFile}`);
const newVersions = {};
const requests = [];
let FLAG_UPDATES = false;

for (const [namespace, plugins] of Object.entries(oldVersions)) {
    newVersions[namespace] = {};
    for (const [plugin, version] of Object.entries(plugins)) {
        const request = getMavenVersions(namespace, plugin);
        requests.push(request);
        request.then(versions => {
            if (!versions) return;
            const latest = versions[0];

            const isNew = !version || compareVersion(latest, version);
            newVersions[namespace][plugin] = isNew ? latest : version;

            if (isNew) FLAG_UPDATES = true;

            if (version) {
                if (isNew)
                    console.log(
                        `Plugin ${namespace}:${plugin} version updated from ${version} to ${latest}`,
                    );
                else console.log(`Plugin ${namespace}:${plugin} version is up to date`);
            } else {
                console.log(`Plugin ${namespace}:${plugin} version set to ${latest}`);
            }
        });
    }
}

Promise.all(requests).then(() => {
    if (!FLAG_UPDATES) {
        console.info('No new versions have been found. No data has been written.');
        return;
    }

    const newFile = JSON.stringify(newVersions, null, 2);
    if (repoDirty) console.log(`Updated ${versionsFile}:\n${newFile}`);
    else
        require('fs').writeFile(versionsFile, newFile, err => {
            if (err) {
                console.error(`Error writing updated versions to ${versionsFile}: ${err.message}`);
            } else {
                console.info(
                    `Updated versions have been written to ${versionsFile}. Please review their compatibility with RNFB before committing.`,
                );
            }
        });
});
