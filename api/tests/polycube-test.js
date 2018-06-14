import { TestManager } from './simple-test-manager.js';

import { Polycube } from '/api/polycube.js';

const pcubeTest = new TestManager("Polycube Test");

export const runPolycubeTest = function(){
	let pCube = new Polycube();

	pcubeTest.assert(true, () => {
		return pCube.id === undefined;
	}, "Check if ID property is private");

	pcubeTest.assert(true, () => {
		return pCube !== undefined;
	}, "Check if polycube was created successfully");

	pcubeTest.assert(true, () => {
		return Polycube.isNameTaken("Polycube 0");
	}, "Check if polycube has default name Polycube_0");

	pcubeTest.assert(false, () => {
		return pCube.addCube(new THREE.Vector3(0, 0, 0));
	}, "Check if cube can be added to <0, 0, 0>, where a cube already exists.");

	pcubeTest.assert(true, () => {
		return pCube.addCube(new THREE.Vector3(0, 1, 0));
	}, "Check if cube can be added at <0, 1, 0>");

	pcubeTest.assert(10, () => {
		return pCube.faceCount;
	}, "Check for correct face count.");

	pcubeTest.assert(false, () => {
		return pCube.addCube(new THREE.Vector3(0, 3, 0))
	}, "Check if cube can be added at <0, 3, 0>, where there are no adjacent cubes.");

	pcubeTest.assert(true, () => {
		return pCube.addCube(new THREE.Vector3(0, -1, 0));
	}, "Check if cube can be added at <0, -1, 0>.");

	pcubeTest.assert(14, () => {
		return pCube.faceCount;
	}, "Check for correct face count.");

	pcubeTest.assert(true, () => {
		return pCube.addCube(new THREE.Vector3(0, 2, 0));
	}, "Check if cube can be added at <0, 2, 0>");

	pcubeTest.assert(true, () => {
		return pCube.addCube(new THREE.Vector3(0, 3, 0));
	}, "Check if cube can be added at <0, 3, 0>");

	pcubeTest.assert(true, () => {
		return pCube.addCube(new THREE.Vector3(1, 0, 0));
	}, "Check if cube can be added at <1, 0, 0>");

	pcubeTest.assert(true, () => {
		return pCube.addCube(new THREE.Vector3(1, 3, 0));
	}, "Check if cube can be added at <1, 3, 0>");

	pCube.name = "Peter";
	pcubeTest.assert("Peter", () => {
		return pCube.name;
	}, "Check if pCube's name is Peter");

	let pCube2 = new Polycube();

	pcubeTest.assert(true, () => {
		return pCube2.addCube(new THREE.Vector3(0, 1, 0));
	}, "Check if pCube2 can add cube to <0, 1, 0>");

	pcubeTest.assert(false, () => {
		return pCube2.addCube(new THREE.Vector3(0, 4, 0));
	}, "Check if pCube2 can add cube to <0, 4, 0>");

	pCube2.name = "Peter";

	pcubeTest.assert(false, () => {
		return pCube2.name === "Peter";
	}, "Check if pCube2's name is Peter");

	pCube.destroy();

	pcubeTest.assert(false, () => {
		return Polycube.isNameTaken("Peter");
	}, "Check if the name Peter is still taken");

	pCube2.name = "Peter";
	pcubeTest.assert("Peter", () => {
		return pCube2.name;
	}, "Check if pCube2's name is Peter.")

	pCube2.name = "Steven";
	pcubeTest.assert(false, () => {
		return Polycube.isNameTaken("Peter");
	}, "Check if Peter is a taken name after changing pCube2's name to Peter");

	pcubeTest.assert(true, () => {
		return Polycube.isNameTaken("Steven");
	}, "Check if Steven is a taken name");
}