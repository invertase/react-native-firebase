import g2js from 'gradle-to-js/lib/parser';
import { GradleDependency } from '../types/cli';
import CliError from './error';

export const pluginVersions = require('../../plugin-versions.json');

function pluginLine(namespace: string, plugin: string) {
    return `apply plugin: '${namespace}.${plugin}'`;
}

export class GradleFile {
    fileText: string;

    constructor(gradleFileText: string) {
        this.fileText = gradleFileText;
    }

    // strip gradle file down to its skeleton, maintaining line structure
    getStrippedFile(): string {
        let strippedFile = this.fileText;
        const onlyLinebreaks = (s: string) => s.replace(/[^\n]/g, '');
        // remove block comments
        strippedFile = strippedFile.replace(/\/\*.*?\*\//gs, onlyLinebreaks);
        // remove single-line comments
        strippedFile = strippedFile.replace(/\/\/.*/g, '');
        // remove everything one bracket deep
        while (
            strippedFile != (strippedFile = strippedFile.replace(/\s*\{[^{}]*\}/g, onlyLinebreaks))
        );
        // trim lines
        strippedFile = strippedFile.replace(/^[ \t]+|[ \t]+$|\r/g, '');
        // remove repeating whitespace, convert tabs into spaces
        strippedFile = strippedFile.replace(/[\t ]+/g, ' ');
        // convert double quotes with single
        strippedFile = strippedFile.replace(/"/g, "'");

        delete this.getStrippedFile;
        this.getStrippedFile = () => strippedFile;
        return strippedFile;
    }

    async getParsedFile(): Promise<g2js.Representation> {
        const parsedFile = await g2js.parseText(this.fileText);

        delete this.getParsedFile;
        this.getParsedFile = async () => parsedFile;
        return parsedFile;
    }

    getPluginBounds(): [number, number] {
        const lines = this.getStrippedFile().split('\n');

        let start: null | number = null,
            end: null | number = null;
        for (const [n, line] of lines.entries()) {
            if (line && !line.startsWith('apply plugin')) {
                if (start === null) start = n;
                end = n;
            }
        }

        if (start === null) start = 1;
        if (end === null) end = lines.length - 2;

        const bounds: [number, number] = [start, end];
        delete this.getPluginBounds;
        this.getPluginBounds = () => bounds;
        return bounds;
    }

    async getPlugin(namespace: string, plugin: string) {
        try {
            const appBuildGradleFile = await this.getParsedFile();
            return appBuildGradleFile.dependencies.find(
                (dependency: GradleDependency) =>
                    dependency.type == 'apply' &&
                    dependency.name == `plugin: '${namespace}.${plugin}'`,
            ) as GradleDependency | undefined;
        } catch (e) {
            throw new CliError('App build.gradle file has an invalid format');
        }
    }

    async getDependency(namespace: string, plugin: string) {
        try {
            const buildGradleFile = await this.getParsedFile();
            return buildGradleFile.buildscript.dependencies.find(
                (dependency: GradleDependency) =>
                    dependency.type == 'classpath' &&
                    dependency.group == namespace &&
                    dependency.name == plugin,
            ) as GradleDependency | undefined;
        } catch (e) {
            throw new CliError('build.gradle file has an invalid format');
        }
    }

    addDependency(namespace: string, plugin: string) {
        const addDependencyRegex = /buildscript[\w\W]*dependencies[\s]*{/g;
        this.fileText = this.fileText.replace(addDependencyRegex, str => {
            return `${str}
    classpath '${namespace}:${plugin}:${pluginVersions[namespace][plugin]}'`;
        });
    }

    updatePluginVersion(namespace: string, plugin: string, oldVersion: string) {
        this.fileText = this.fileText.replace(
            `'${namespace}:${plugin}:${oldVersion}'`,
            `'${namespace}:${plugin}:${pluginVersions[namespace][plugin]}'`,
        );
    }

    registerPlugin(namespace: string, plugin: string, position: 'top' | 'bottom') {
        const line = pluginLine(namespace, plugin);
        switch (position) {
            case 'top':
                // place below com.android.application if in sensible place, otherwise place at top
                const sLines = this.getStrippedFile().split('\n');
                const appPos = sLines.indexOf(pluginLine('com.android', 'application'));
                const [start] = this.getPluginBounds();
                if (appPos != -1 && appPos < start) {
                    const lines = this.fileText.split('\n');
                    lines.splice(appPos + 1, 0, line);
                    this.fileText = lines.join('\n');
                } else this.fileText = `${line}\n${this.fileText}`;
                break;
            case 'bottom':
                this.fileText = `${this.fileText}\n${line}`;
                break;
        }
    }

    verifyPlugin(namespace: string, plugin: string, position: 'top' | 'bottom') {
        const lines = this.getStrippedFile().split('\n');
        const pluginPos = lines.indexOf(pluginLine(namespace, plugin));

        if (pluginPos == -1) return null;

        const [start, end] = this.getPluginBounds();
        if (position == 'top') {
            if (pluginPos < start) return true;
            else return false;
        } else {
            if (pluginPos > end) return true;
            else return false;
        }
    }

    removePlugin(namespace: string, plugin: string) {
        const sLines = this.getStrippedFile().split('\n');
        const pluginPos = sLines.indexOf(pluginLine(namespace, plugin));
        if (pluginPos == -1) return;

        const lines = this.fileText.split('\n');
        lines.splice(pluginPos, 1);
        this.fileText = lines.join('\n');
    }
}
